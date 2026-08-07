from app.domain.models import Ingredient, Recipe


MOCK_RECIPES: list[Recipe] = [
    Recipe(
        id="gamja-egg-stirfry",
        title="감자계란볶음",
        emoji="🥔",
        themes=["간단한 한 끼", "15분 요리", "저예산 요리"],
        servings=2,
        difficulty="쉬움",
        cooking_time=15,
        ingredients=[
            Ingredient(name="감자", amount="2개", required=True),
            Ingredient(name="계란", amount="2개", required=True),
            Ingredient(name="양파", amount="1/2개", required=True),
            Ingredient(name="식용유", amount="1큰술", required=False),
            Ingredient(name="소금", amount="약간", required=False),
        ],
        preparation_steps=["감자와 양파를 얇게 썰어요.", "계란을 가볍게 풀어둬요."],
        cooking_steps=[
            "팬에 식용유를 두르고 감자와 양파를 먼저 볶아요.",
            "감자가 익기 시작하면 풀어둔 계란을 넣고 함께 볶아요.",
            "소금으로 간을 맞추고 바로 담아내요.",
        ],
        safety_notes=["감자는 속까지 익도록 충분히 볶아주세요."],
    ),
    Recipe(
        id="kimchi-jeon",
        title="김치전",
        emoji="🥘",
        themes=["술안주", "간단한 한 끼", "캠핑"],
        servings=2,
        difficulty="쉬움",
        cooking_time=20,
        ingredients=[
            Ingredient(name="김치", amount="1컵", required=True),
            Ingredient(name="부침가루", amount="1컵", required=True),
            Ingredient(name="물", amount="2/3컵", required=True),
            Ingredient(name="대파", amount="1/2대", required=False),
        ],
        preparation_steps=["김치를 먹기 좋게 잘라요.", "반죽 재료를 섞어요."],
        cooking_steps=[
            "반죽에 김치를 넣고 고르게 섞어요.",
            "팬에 반죽을 얇게 펴고 앞뒤로 노릇하게 익혀요.",
        ],
        safety_notes=["팬이 충분히 달궈진 뒤 반죽을 올려주세요."],
    ),
    Recipe(
        id="camping-ramen-upgrade",
        title="버섯대파 캠핑라면",
        emoji="🍜",
        themes=["캠핑", "간단한 한 끼"],
        servings=2,
        difficulty="쉬움",
        cooking_time=10,
        ingredients=[
            Ingredient(name="라면", amount="2개", required=True),
            Ingredient(name="대파", amount="1/2대", required=True),
            Ingredient(name="버섯", amount="한 줌", required=False),
            Ingredient(name="계란", amount="1개", required=False),
        ],
        preparation_steps=["대파와 버섯을 썰어요."],
        cooking_steps=[
            "물을 끓인 뒤 라면 수프와 면을 넣어요.",
            "대파와 버섯을 넣고 2분 더 끓여요.",
            "원하면 계란을 넣고 익혀 마무리해요.",
        ],
        safety_notes=["끓는 물에 재료를 넣을 때 화상에 주의하세요."],
    ),
]
