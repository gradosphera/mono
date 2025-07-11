#include <eosio/datastream.hpp>
#include <eosio/eosio.hpp>
#include <eosio/multi_index.hpp>
#include <eosio/privileged.hpp>
#include <eosio/serialize.hpp>
#include <eosio/transaction.hpp>

#include <eosio.system/eosio.system.hpp>
#include <eosio.token/eosio.token.hpp>

namespace eosiosystem {

   using eosio::asset;
   using eosio::const_mem_fun;
   using eosio::current_time_point;
   using eosio::indexed_by;
   using eosio::permission_level;
   using eosio::seconds;
   using eosio::time_point_sec;
   using eosio::token;

   /**
    *  This action will buy an exact amount of ram and bill the payer the current market price.
    */
   void system_contract::buyrambytes( const name& payer, const name& receiver, uint32_t bytes ) {
      auto itr = _rammarket.find(ramcore_symbol.raw());
      const int64_t ram_reserve   = itr->base.balance.amount;
      const int64_t eos_reserve   = itr->quote.balance.amount;
      const int64_t cost          = exchange_state::get_bancor_input( ram_reserve, eos_reserve, bytes );
      buyram( payer, receiver, asset{ cost, core_symbol() } );
   }


   /**
    *  When buying ram the payer irreversibly transfers quant to system contract and only
    *  the receiver may reresult the tokens via the sellram action. The receiver pays for the
    *  storage of all database records associated with this action.
    *
    *  RAM is a scarce resource whose supply is defined by global properties max_ram_size. RAM is
    *  priced using the bancor algorithm such that price-per-byte with a constant reserve ratio of 100:1.
    */
   void system_contract::buyram( const name& payer, const name& receiver, const asset& quant )
    {
      require_auth( payer );
      update_ram_supply();

      powerup_state_singleton state_sing{ get_self(), 0 };
      if (!state_sing.exists()) {
        check( quant.symbol == core_symbol(), "must buy ram with core token" );
        check( quant.amount > 0, "must purchase a positive amount" );

        auto quant_after_fee = quant; // Полная сумма идет на покупку RAM, без вычета комиссии

        {
          token::transfer_action transfer_act{ token_account, { {payer, active_permission}, {ram_account, active_permission} } };
          transfer_act.send( payer, ram_account, quant_after_fee, "buy ram" );
        }

        int64_t bytes_out;

        const auto& market = _rammarket.get(ramcore_symbol.raw(), "ram market does not exist");
        _rammarket.modify( market, same_payer, [&]( auto& es ) {
          bytes_out = es.direct_convert( quant,  ram_symbol ).amount;
        });

        check( _gstate.total_ram_bytes_reserved + uint64_t(bytes_out) <= _gstate.max_ram_size, "покупка RAM сейчас невозможна." );

        check( bytes_out > 0, "must reserve a positive amount" );

        _gstate.total_ram_stake          += quant.amount;
        _gstate.total_ram_bytes_reserved += uint64_t(bytes_out);
        
        user_resources_table  userres( get_self(), receiver.value );
        auto res_itr = userres.find( receiver.value );
        if( res_itr ==  userres.end() ) {
          res_itr = userres.emplace( receiver, [&]( auto& res ) {
                res.owner = receiver;
                res.net_weight = asset( 0, core_symbol() );
                res.cpu_weight = asset( 0, core_symbol() );
                res.ram_bytes = bytes_out;
              });
        } else {
          userres.modify( res_itr, receiver, [&]( auto& res ) {
                res.ram_bytes += bytes_out;
              });
        }

        auto voter_itr = _voters.find( res_itr->owner.value );
        if( voter_itr == _voters.end() || !has_field( voter_itr->flags1, voter_info::flags1_fields::ram_managed ) ) {
          int64_t ram_bytes, net, cpu;
          get_resource_limits( res_itr->owner, ram_bytes, net, cpu );
          set_resource_limits( res_itr->owner, res_itr->ram_bytes + ram_gift_bytes, net, cpu );
        }

      } else {
        eosio::print("Метод безопасно закрыт для вызова");
      }
    }


  void system_contract::sellram( const name& account, int64_t bytes ) {
      require_auth(get_self());
      update_ram_supply();
      
      powerup_state_singleton state_sing{ get_self(), 0 };
      if (!state_sing.exists()) {
        
        check( bytes > 0, "cannot sell negative byte" );

        user_resources_table  userres( get_self(), account.value );
        auto res_itr = userres.find( account.value );
        check( res_itr != userres.end(), "no resource row" );
        check( res_itr->ram_bytes >= bytes, "insufficient quota" );

        check( bytes > 0, "cannot back negative byte" );

        asset tokens_out;
        auto itr = _rammarket.find(ramcore_symbol.raw());
        
        _rammarket.modify( itr, same_payer, [&]( auto& es ) {
            tokens_out = es.direct_convert( asset(bytes, ram_symbol), core_symbol());
        });

        check( tokens_out.amount > 1, "token amount received from selling ram is too low" );
        
        _gstate.total_ram_bytes_reserved -= static_cast<decltype(_gstate.total_ram_bytes_reserved)>(bytes);
        _gstate.total_ram_stake          -= tokens_out.amount;
        
        check( _gstate.total_ram_stake >= 0, "error, attempt to unstake more tokens than previously staked" );
        

        auto voter_itr = _voters.find( res_itr->owner.value );
        if( voter_itr == _voters.end() || !has_field( voter_itr->flags1, voter_info::flags1_fields::ram_managed ) ) {
          int64_t ram_usage, net, cpu;
          get_resource_limits( res_itr->owner, ram_usage, net, cpu );
          set_resource_limits( res_itr->owner, res_itr->ram_bytes + ram_gift_bytes, net, cpu );
        }

        userres.modify( res_itr, same_payer, [&]( auto& res ) {
            res.ram_bytes -= bytes;
        });
      } else {
        eosio::print("Метод безопасно закрыт для вызова");
      }
  }

   void system_contract::changebw( name from, const name& receiver,
                                   const asset& stake_net_delta, const asset& stake_cpu_delta, bool transfer )
   {
      require_auth( from );
      check( stake_net_delta.amount != 0 || stake_cpu_delta.amount != 0, "should stake non-zero amount" );
      check( std::abs( (stake_net_delta + stake_cpu_delta).amount )
             >= std::max( std::abs( stake_net_delta.amount ), std::abs( stake_cpu_delta.amount ) ),
             "net and cpu deltas cannot be opposite signs" );

      name source_stake_from = from;
      if ( transfer ) {
         from = receiver;
      }

      // update stake delegated from "from" to "receiver"
      {
         del_bandwidth_table     del_tbl( get_self(), from.value );
         auto itr = del_tbl.find( receiver.value );
         if( itr == del_tbl.end() ) {
            itr = del_tbl.emplace( from, [&]( auto& dbo ){
                  dbo.from          = from;
                  dbo.to            = receiver;
                  dbo.net_weight    = stake_net_delta;
                  dbo.cpu_weight    = stake_cpu_delta;
               });
         }
         else {
            del_tbl.modify( itr, same_payer, [&]( auto& dbo ){
                  dbo.net_weight    += stake_net_delta;
                  dbo.cpu_weight    += stake_cpu_delta;
               });
         }
         check( 0 <= itr->net_weight.amount, "insufficient staked net bandwidth" );
         check( 0 <= itr->cpu_weight.amount, "insufficient staked cpu bandwidth" );
         if ( itr->is_empty() ) {
            del_tbl.erase( itr );
         }
      } // itr can be invalid, should go out of scope

      // update totals of "receiver"
      {
         user_resources_table   totals_tbl( get_self(), receiver.value );
         auto tot_itr = totals_tbl.find( receiver.value );
         if( tot_itr ==  totals_tbl.end() ) {
            tot_itr = totals_tbl.emplace( from, [&]( auto& tot ) {
                  tot.owner = receiver;
                  tot.net_weight    = stake_net_delta;
                  tot.cpu_weight    = stake_cpu_delta;
               });
         } else {
            totals_tbl.modify( tot_itr, from == receiver ? from : same_payer, [&]( auto& tot ) {
                  tot.net_weight    += stake_net_delta;
                  tot.cpu_weight    += stake_cpu_delta;
               });
         }
         check( 0 <= tot_itr->net_weight.amount, "insufficient staked total net bandwidth" );
         check( 0 <= tot_itr->cpu_weight.amount, "insufficient staked total cpu bandwidth" );

         {
            bool ram_managed = false;
            bool net_managed = false;
            bool cpu_managed = false;

            auto voter_itr = _voters.find( receiver.value );
            if( voter_itr != _voters.end() ) {
               ram_managed = has_field( voter_itr->flags1, voter_info::flags1_fields::ram_managed );
               net_managed = has_field( voter_itr->flags1, voter_info::flags1_fields::net_managed );
               cpu_managed = has_field( voter_itr->flags1, voter_info::flags1_fields::cpu_managed );
            }

            if( !(net_managed && cpu_managed) ) {
               int64_t ram_bytes, net, cpu;
               get_resource_limits( receiver, ram_bytes, net, cpu );

               set_resource_limits( receiver,
                                    ram_managed ? ram_bytes : std::max( tot_itr->ram_bytes + ram_gift_bytes, ram_bytes ),
                                    net_managed ? net : tot_itr->net_weight.amount,
                                    cpu_managed ? cpu : tot_itr->cpu_weight.amount );
            }
         }

         if ( tot_itr->is_empty() ) {
            totals_tbl.erase( tot_itr );
         }
      } // tot_itr can be invalid, should go out of scope

      
      powerup_state_singleton state_sing{ get_self(), 0 };
      
      // create refund or update from existing refund only if powerup is not enabled
      if ( stake_account != source_stake_from && !state_sing.exists() ) { //for eosio both transfer and refund make no sense
         refunds_table refunds_tbl( get_self(), from.value );
         auto req = refunds_tbl.find( from.value );

         //create/update/delete refund
         auto net_balance = stake_net_delta;
         auto cpu_balance = stake_cpu_delta;
         bool need_deferred_trx = false;


         // net and cpu are same sign by assertions in delegatebw and undelegatebw
         // redundant assertion also at start of changebw to protect against misuse of changebw
         bool is_undelegating = (net_balance.amount + cpu_balance.amount ) < 0;
         bool is_delegating_to_self = (!transfer && from == receiver);

         if( is_delegating_to_self || is_undelegating ) {
            if ( req != refunds_tbl.end() ) { //need to update refund
               refunds_tbl.modify( req, same_payer, [&]( refund_request& r ) {
                  if ( net_balance.amount < 0 || cpu_balance.amount < 0 ) {
                     r.request_time = current_time_point();
                  }
                  r.net_amount -= net_balance;
                  if ( r.net_amount.amount < 0 ) {
                     net_balance = -r.net_amount;
                     r.net_amount.amount = 0;
                  } else {
                     net_balance.amount = 0;
                  }
                  r.cpu_amount -= cpu_balance;
                  if ( r.cpu_amount.amount < 0 ){
                     cpu_balance = -r.cpu_amount;
                     r.cpu_amount.amount = 0;
                  } else {
                     cpu_balance.amount = 0;
                  }
               });

               check( 0 <= req->net_amount.amount, "negative net refund amount" ); //should never happen
               check( 0 <= req->cpu_amount.amount, "negative cpu refund amount" ); //should never happen

               if ( req->is_empty() ) {
                  refunds_tbl.erase( req );
                  need_deferred_trx = false;
               } else {
                  need_deferred_trx = true;
               }
            } else if ( net_balance.amount < 0 || cpu_balance.amount < 0 ) { //need to create refund
               refunds_tbl.emplace( from, [&]( refund_request& r ) {
                  r.owner = from;
                  if ( net_balance.amount < 0 ) {
                     r.net_amount = -net_balance;
                     net_balance.amount = 0;
                  } else {
                     r.net_amount = asset( 0, core_symbol() );
                  }
                  if ( cpu_balance.amount < 0 ) {
                     r.cpu_amount = -cpu_balance;
                     cpu_balance.amount = 0;
                  } else {
                     r.cpu_amount = asset( 0, core_symbol() );
                  }
                  r.request_time = current_time_point();
               });
               need_deferred_trx = true;
            } // else stake increase requested with no existing row in refunds_tbl -> nothing to do with refunds_tbl
         } /// end if is_delegating_to_self || is_undelegating

         if ( need_deferred_trx ) {
            eosio::transaction out;
            out.actions.emplace_back( permission_level{from, active_permission},
                                      get_self(), "refund"_n,
                                      from
            );
            out.delay_sec = refund_delay_sec;
            eosio::cancel_deferred( from.value ); // TODO: Remove this line when replacing deferred transactions is fixed
            out.send( from.value, from, true );
         } else {
            eosio::cancel_deferred( from.value );
         }

         auto transfer_amount = net_balance + cpu_balance;
         if ( 0 < transfer_amount.amount ) {
            token::transfer_action transfer_act{ token_account, { {source_stake_from, active_permission} } };
            transfer_act.send( source_stake_from, stake_account, asset(transfer_amount), "stake bandwidth" );
         }
      }

      update_voting_power( from, stake_net_delta + stake_cpu_delta );
   }

   void system_contract::update_voting_power( const name& voter, const asset& total_update )
   {
      auto voter_itr = _voters.find( voter.value );
      if( voter_itr == _voters.end() ) {
         voter_itr = _voters.emplace( voter, [&]( auto& v ) {
            v.owner  = voter;
            v.staked = total_update.amount;
         });
      } else {
         _voters.modify( voter_itr, same_payer, [&]( auto& v ) {
            v.staked += total_update.amount;
         });
      }

      check( 0 <= voter_itr->staked, "stake for voting cannot be negative" );

      if( voter_itr->producers.size() || voter_itr->proxy ) {
         update_votes( voter, voter_itr->proxy, voter_itr->producers, false );
      }
   }

   void system_contract::delegatebw( const name& from, const name& receiver,
                                     const asset& stake_net_quantity,
                                     const asset& stake_cpu_quantity, bool transfer )
   {
      asset zero_asset( 0, core_symbol() );
      check( stake_cpu_quantity >= zero_asset, "must stake a positive amount" );
      check( stake_net_quantity >= zero_asset, "must stake a positive amount" );
      check( stake_net_quantity.amount + stake_cpu_quantity.amount > 0, "must stake a positive amount" );
      check( !transfer || from != receiver, "cannot use transfer flag if delegating to self" );
      
      powerup_state_singleton state_sing{ get_self(), 0 };
      if (!state_sing.exists()) {
        changebw( from, receiver, stake_net_quantity, stake_cpu_quantity, transfer);
      } else {
        eosio::print("Метод безопасно закрыт для вызова");
      }
      
   } // delegatebw

   void system_contract::undelegatebw( const name& from, const name& receiver,
                                       const asset& unstake_net_quantity, const asset& unstake_cpu_quantity )
   {
      asset zero_asset( 0, core_symbol() );
      check( unstake_cpu_quantity >= zero_asset, "must unstake a positive amount" );
      check( unstake_net_quantity >= zero_asset, "must unstake a positive amount" );
      check( unstake_cpu_quantity.amount + unstake_net_quantity.amount > 0, "must unstake a positive amount" );
      check( _gstate.thresh_activated_stake_time != time_point(),
             "cannot undelegate bandwidth until the chain is activated (at least 15% of all tokens participate in voting)" );
      
      powerup_state_singleton state_sing{ get_self(), 0 };
      if (!state_sing.exists()) {
        changebw( from, receiver, -unstake_net_quantity, -unstake_cpu_quantity, false);
      } else {
        eosio::print("Метод безопасно закрыт для вызова");
      }
      
   } // undelegatebw


   void system_contract::refund( const name& owner ) {
      require_auth( owner );

      refunds_table refunds_tbl( get_self(), owner.value );
      auto req = refunds_tbl.find( owner.value );
      check( req != refunds_tbl.end(), "refund request not found" );
      check( req->request_time + seconds(refund_delay_sec) <= current_time_point(),
             "refund is not available yet" );
      token::transfer_action transfer_act{ token_account, { {stake_account, active_permission}, {req->owner, active_permission} } };
      transfer_act.send( stake_account, req->owner, req->net_amount + req->cpu_amount, "unstake" );
      refunds_tbl.erase( req );
   }


} //namespace eosiosystem
