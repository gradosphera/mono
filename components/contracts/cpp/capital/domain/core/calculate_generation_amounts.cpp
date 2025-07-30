using namespace eosio;
using std::string;

namespace Capital {

  
/**
  * @brief Структура результата расчета бонусов.
  */
struct generation_result {
  asset author_base;
  asset creator_base;
  asset creators_bonus;
  asset authors_bonus;
  asset generated;
  asset capitalists_bonus;
  asset total;
};

//----------------------------------------------------------------------------
// calculcate_generation_amounts: для расчёта премий по формулам:
//   - creators_bonus      = spended * 0.382
//   - authors_bonus       = spended * 0.618
//   - generated           = spended + creators_bonus + authors_bonus
//   - capitalists_bonus  = generated * 1.618
//   - total               = generated + capitalists_bonus
//----------------------------------------------------------------------------
generation_result calculcate_generation_amounts(const eosio::asset& spended) {
  generation_result br;

  double amount = static_cast<double>(spended.amount);
  eosio::symbol sym = spended.symbol;
  
  br.creator_base = spended;
  br.author_base = spended;
  
  br.creators_bonus     = eosio::asset(int64_t(amount * 0.382), sym);
  br.authors_bonus      = eosio::asset(int64_t(amount * 0.618), sym);
  br.generated          = eosio::asset(br.creator_base.amount + br.creators_bonus.amount + br.authors_bonus.amount + br.author_base.amount, sym);
  br.capitalists_bonus  = eosio::asset( int64_t(static_cast<double>(br.generated.amount) * 1.618), sym);
  br.total              = eosio::asset(br.generated.amount + br.capitalists_bonus.amount, sym);

  return br;
}

} // namespace Capital