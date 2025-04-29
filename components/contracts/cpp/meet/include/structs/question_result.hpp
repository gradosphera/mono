// Например, во внешем header можно объявить структуру:
struct question_result {
    uint64_t question_id;
    std::string title;
    std::string decision;
    std::string context;
    uint64_t votes_for;
    uint64_t votes_against;
    uint64_t votes_abstained;
    bool accepted;
};
