void meet::newgdecision(NEWGDECISION_SIGNATURE) {
    require_auth(_meet);
    require_recipient(coopname);
}