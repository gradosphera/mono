
void capital::withdraw1(name coopname, name username, asset amount) {
    require_auth(username);
    check(amount.symbol == TOKEN_SYMBOL, "Invalid token symbol");
    check(amount.is_valid(), "Invalid asset");
    check(amount.amount > 0, "Amount must be positive");

    auto gs = get_global_state(coopname);

    // Participants table
    // TODO: Create gateway withdraw payment
    
}

void capital::withdraw2(name coopname, name username, asset amount) {
    require_auth(username);
    check(amount.symbol == TOKEN_SYMBOL, "Invalid token symbol");
    check(amount.is_valid(), "Invalid asset");
    check(amount.amount > 0, "Amount must be positive");

    auto gs = get_global_state(coopname);

}

