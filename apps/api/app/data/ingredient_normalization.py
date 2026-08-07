INGREDIENT_SYNONYMS: dict[str, str] = {
    "감자": "감자",
    "계란": "계란",
    "고추": "고추",
    "김치": "김치",
    "당근": "당근",
    "대파": "대파",
    "돼지고기": "돼지고기",
    "목살": "돼지고기",
    "삼겹살": "돼지고기",
    "두부": "두부",
    "라면": "라면",
    "마늘": "마늘",
    "버섯": "버섯",
    "베이컨": "베이컨",
    "브로콜리": "브로콜리",
    "소고기": "소고기",
    "쇠고기": "소고기",
    "양배추": "양배추",
    "양파": "양파",
    "애호박": "애호박",
    "오이": "오이",
    "쪽파": "대파",
    "참치": "참치",
    "참치캔": "참치",
    "치즈": "치즈",
    "토마토": "토마토",
    "파": "대파",
    "파스타": "파스타면",
    "파스타면": "파스타면",
    "파프리카": "파프리카",
    "햄": "햄",
    "후추": "후추",
}


def normalize_ingredient_name(name: str) -> str:
    trimmed = name.strip().lower()
    if not trimmed:
        return ""

    normalized_key = trimmed.replace(" ", "")
    return INGREDIENT_SYNONYMS.get(normalized_key, name.strip())
