struct vote_point {
    uint64_t question_id; ///< Идентификатор вопроса
    name vote;            ///< Голос: "for"_n, "against"_n, "abstained"_n
};