const characters = [
  {
    id: "harin",
    name: "하린",
    mark: "하",
    role: "자취 생활 캐릭터",
    categories: ["생활가전", "식품", "굿즈"],
    baseScore: 74,
    hook: "방과 루틴이 좋아질수록 생활력이 오르는 캐릭터",
  },
  {
    id: "mina",
    name: "미나",
    mark: "미",
    role: "뷰티 큐레이터",
    categories: ["뷰티", "건강", "패션"],
    baseScore: 70,
    hook: "상품을 비교하고 팬에게 맞는 사용 루틴을 제안하는 캐릭터",
  },
  {
    id: "ido",
    name: "이도",
    mark: "이",
    role: "IT 리뷰어",
    categories: ["IT가젯", "생활가전"],
    baseScore: 72,
    hook: "새 장비를 테스트하며 리뷰 레벨이 오르는 캐릭터",
  },
  {
    id: "yoonseo",
    name: "윤서",
    mark: "윤",
    role: "아이돌 연습생",
    categories: ["패션", "뷰티", "굿즈"],
    baseScore: 68,
    hook: "팬의 응원과 선택이 무대 준비에 반영되는 캐릭터",
  },
  {
    id: "doyun",
    name: "도윤",
    mark: "도",
    role: "운동 루틴 코치",
    categories: ["건강", "식품", "패션"],
    baseScore: 69,
    hook: "팬들과 함께 루틴을 완성하며 활동 레벨이 오르는 캐릭터",
  },
];

const categoryProfiles = {
  생활가전: {
    type: "Product Quest",
    audience: "1인 가구, 자취생, 소형가전 관심층",
    motivation: "방 업그레이드, 편의성, 선물",
    growth: "인지도 + 생활력",
    risk: "보통",
    summary:
      "자취방, 책상, 작은 침실처럼 공간이 좁은 장면에 자연스럽게 들어가는 생활 업그레이드형 상품입니다.",
  },
  뷰티: {
    type: "Review Vlog",
    audience: "2030 여성, 민감 피부 관심층, 뷰티 루틴 소비자",
    motivation: "성분, 사용감, 전후 비교, 루틴 개선",
    growth: "인지도 + 친밀도",
    risk: "주의",
    summary:
      "사용감과 루틴 설명이 중요한 상품입니다. 캐릭터의 취향과 피부 고민을 연결한 비교형 브이로그가 적합합니다.",
  },
  식품: {
    type: "Fan Mission",
    audience: "간편식 구매자, 자취생, 직장인, 야식/간식 관심층",
    motivation: "맛, 가격, 편의성, 재구매",
    growth: "활동 + 수익력",
    risk: "낮음",
    summary:
      "짧은 먹방, 루틴, 팬 미션으로 전환하기 쉽습니다. 쿠폰이나 공동구매형 공유링크와 잘 맞습니다.",
  },
  건강: {
    type: "Coupon Drop",
    audience: "루틴 관리층, 운동 관심층, 3040 건강 관심층",
    motivation: "신뢰, 반복 섭취, 할인, 루틴 형성",
    growth: "수익력 + 활동",
    risk: "높음",
    summary:
      "신뢰와 표시 검수가 중요한 상품입니다. 효능 표현을 제한하고 루틴 참여형 캠페인으로 설계해야 합니다.",
  },
  패션: {
    type: "Product Quest",
    audience: "스타일 관심층, 팬덤 소비자, 1020/2030 여성",
    motivation: "착용 장면, 팬 선택, 시즌 스타일",
    growth: "인지도 + 친밀도",
    risk: "낮음",
    summary:
      "캐릭터의 의상 변화와 바로 연결할 수 있습니다. 팬 투표, 새 룩 공개, 저장/공유 목표와 잘 맞습니다.",
  },
  IT가젯: {
    type: "Review Vlog",
    audience: "테크 얼리어답터, 남성 IT 관심층, 선물 구매자",
    motivation: "성능, 언박싱, 비교, 실사용 장면",
    growth: "서사력 + 인지도",
    risk: "보통",
    summary:
      "비교 리뷰와 언박싱 장면에 적합합니다. 캐릭터가 장비를 얻고 능력이 확장되는 구조로 만들기 좋습니다.",
  },
  굿즈: {
    type: "Fan Mission",
    audience: "팬덤 소비자, 굿즈 수집층, 이벤트 참여자",
    motivation: "소장, 한정판, 팬 참여, 커뮤니티 공유",
    growth: "친밀도 + 수익력",
    risk: "낮음",
    summary:
      "팬덤 참여와 직접 연결됩니다. 공유 목표 달성 시 새 굿즈나 팬전용 장면 해금이 자연스럽습니다.",
  },
};

let selectedCharacterId = "harin";
let progressCount = 0;
let latestAnalysis = null;
let currentCampaign = null;

const $ = (selector) => document.querySelector(selector);

const form = $("#campaignForm");
const productUrl = $("#productUrl");
const brandName = $("#brandName");
const productName = $("#productName");
const priceAmount = $("#priceAmount");
const category = $("#category");
const benefitText = $("#benefitText");
const requiredCopy = $("#requiredCopy");
const prohibitedCopy = $("#prohibitedCopy");

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error?.message || "API 요청에 실패했습니다.");
  }
  return payload;
}

function buildPayload(forceInfer = false) {
  return {
    productUrl: productUrl.value.trim(),
    brandName: brandName.value.trim(),
    productName: productName.value.trim(),
    priceAmount: priceAmount.value.trim(),
    category: category.value,
    campaignGoal: getCurrentGoal(),
    benefitText: benefitText.value.trim(),
    requiredCopy: requiredCopy.value.trim(),
    prohibitedCopy: prohibitedCopy.value.trim(),
    selectedCharacterId,
    forceInfer,
  };
}

function getGoalLabel(goal) {
  const labels = {
    click: "클릭",
    coupon: "쿠폰",
    purchase: "구매",
    live_view: "라방 유입",
  };
  return labels[goal] ?? "클릭";
}

function getCurrentGoal() {
  return new FormData(form).get("campaignGoal") || "click";
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function inferFromUrl(url) {
  const lowered = decodeURIComponent(url).toLowerCase();
  const presets = [
    {
      keys: ["beauty", "cream", "serum", "skin", "cosmetic", "수분", "크림"],
      category: "뷰티",
      product: "저자극 수분크림",
      brand: "Mellow",
      price: "32,000원",
    },
    {
      keys: ["food", "snack", "meal", "coffee", "간편식", "간식", "커피"],
      category: "식품",
      product: "오트밀 단백질 바",
      brand: "Daily Bite",
      price: "18,900원",
    },
    {
      keys: ["health", "vitamin", "protein", "supplement", "비타민", "단백질"],
      category: "건강",
      product: "데일리 비타민 젤리",
      brand: "Routine Lab",
      price: "29,000원",
    },
    {
      keys: ["fashion", "shirt", "hoodie", "bag", "옷", "후드", "가방"],
      category: "패션",
      product: "라이트 후드 집업",
      brand: "Mode Room",
      price: "59,000원",
    },
    {
      keys: ["tech", "gadget", "charger", "keyboard", "it", "충전기", "키보드"],
      category: "IT가젯",
      product: "3포트 고속 충전기",
      brand: "Voltly",
      price: "39,000원",
    },
    {
      keys: ["goods", "merch", "poster", "keyring", "굿즈", "키링"],
      category: "굿즈",
      product: "한정판 아크릴 키링",
      brand: "Fanmade",
      price: "12,000원",
    },
  ];

  const found = presets.find((preset) => preset.keys.some((key) => lowered.includes(key)));
  return (
    found || {
      category: "생활가전",
      product: "미니 공기청정기",
      brand: "Airly",
      price: "49,000원",
    }
  );
}

function hydrateProductFields() {
  const inferred = inferFromUrl(productUrl.value);
  brandName.value = inferred.brand;
  productName.value = inferred.product;
  priceAmount.value = inferred.price;
  category.value = inferred.category;
}

function applyServerDraft(draft) {
  brandName.value = draft.product.brand;
  productName.value = draft.product.name;
  priceAmount.value = draft.product.price;
  category.value = draft.product.category;
  selectedCharacterId = draft.selectedCharacter.id;
}

function buildAnalysis() {
  const profile = categoryProfiles[category.value];
  const goal = getCurrentGoal();
  const goalLabel = getGoalLabel(goal);
  const selected = characters.find((character) => character.id === selectedCharacterId) || characters[0];
  const shareTarget = goal === "live_view" ? "300 라방 유입" : goal === "purchase" ? "50 구매" : "500 클릭";

  return {
    url: productUrl.value.trim(),
    brand: brandName.value.trim() || "Brand",
    product: productName.value.trim() || "상품명 미정",
    price: priceAmount.value.trim() || "가격 미정",
    category: category.value,
    benefit: benefitText.value.trim(),
    required: requiredCopy.value.trim(),
    prohibited: prohibitedCopy.value.trim(),
    goal,
    goalLabel,
    type: profile.type,
    audience: profile.audience,
    motivation: profile.motivation,
    growth: profile.growth,
    risk: profile.risk,
    summary: profile.summary,
    selected,
    shareTarget,
  };
}

function scoreCharacter(character, analysis) {
  const categoryBoost = character.categories.includes(analysis.category) ? 16 : 0;
  const goalBoost =
    analysis.goal === "live_view" && character.id === "yoonseo"
      ? 8
      : analysis.goal === "purchase" && ["harin", "mina", "ido"].includes(character.id)
        ? 5
        : analysis.goal === "coupon" && ["harin", "doyun"].includes(character.id)
          ? 6
          : 0;
  const riskPenalty = analysis.risk === "높음" && character.id === "yoonseo" ? -8 : 0;
  return Math.max(42, Math.min(96, character.baseScore + categoryBoost + goalBoost + riskPenalty));
}

function getTopCharacterId(analysis) {
  return characters
    .map((character) => ({ id: character.id, score: scoreCharacter(character, analysis) }))
    .sort((a, b) => b.score - a.score)[0].id;
}

function renderProduct(analysis) {
  $("#productCategory").textContent = analysis.category;
  $("#productTitle").textContent = `${analysis.brand} ${analysis.product}`;
  $("#productSummary").textContent = analysis.summary;
  $("#campaignType").textContent = analysis.type;
  $("#riskLevel").textContent = analysis.risk;
  $("#shareGoal").textContent = analysis.shareTarget;
  $("#targetAudience").textContent = analysis.audience;
  $("#purchaseMotivation").textContent = analysis.motivation;
  $("#growthStat").textContent = analysis.growth;
}

function renderCharacters(analysis) {
  const grid = $("#characterGrid");
  const scored = characters
    .map((character) => ({ ...character, score: scoreCharacter(character, analysis) }))
    .sort((a, b) => b.score - a.score);

  if (!scored.some((character) => character.id === selectedCharacterId)) {
    selectedCharacterId = scored[0].id;
  }

  grid.innerHTML = scored
    .map((character) => {
      const selected = character.id === selectedCharacterId;
      return `
        <article class="character-card${selected ? " is-selected" : ""}">
          <div class="avatar">${character.mark}</div>
          <h3>${character.name}</h3>
          <p class="character-role">${character.role}</p>
          <div class="score-line">
            <span>적합도</span>
            <strong>${character.score}</strong>
          </div>
          <div class="score-meter" aria-hidden="true">
            <span style="width: ${character.score}%"></span>
          </div>
          <p class="character-reason">${buildReason(character, analysis)}</p>
          <button class="ghost-button select-character" type="button" data-character-id="${character.id}">
            선택
          </button>
        </article>
      `;
    })
    .join("");
}

function buildReason(character, analysis) {
  if (character.categories.includes(analysis.category)) {
    return `${analysis.category} 상품을 ${character.role}의 성장 퀘스트로 자연스럽게 연결할 수 있습니다.`;
  }
  return `${character.name} 캐릭터는 직접 카테고리 적합도는 낮지만, 팬 미션이나 쿠폰 캠페인으로 테스트 가능합니다.`;
}

function renderBrief(analysis) {
  const character = characters.find((item) => item.id === selectedCharacterId) || analysis.selected;
  const questName = getQuestName(character, analysis);
  const goalPhrase =
    analysis.goal === "live_view"
      ? "라방 알림을 받고"
      : analysis.goal === "coupon"
        ? "쿠폰을 받고"
        : analysis.goal === "purchase"
          ? "상품을 확인하고"
          : "공유링크에 참여하고";

  $("#storyHook").textContent = `${character.name} 캐릭터가 ${analysis.product} 상품을 경험하며 ${questName}를 진행합니다. 팬들이 ${goalPhrase} 목표를 달성하면 캐릭터 성장 로그에 반영됩니다.`;
  $("#shareCopy").textContent = `${character.name}의 ${questName}에 참여하고 ${analysis.brand} ${analysis.product} ${analysis.benefit || "혜택"}을 확인해보세요.`;
  $("#complianceCopy").textContent = `광고 및 AI 캐릭터 콘텐츠 표시가 필요합니다. 금지 문구: ${analysis.prohibited || "브랜드 검수 전 과장 표현 금지"}`;
}

function getQuestName(character, analysis) {
  const byCategory = {
    생활가전: "방 업그레이드 퀘스트",
    뷰티: "루틴 실험 퀘스트",
    식품: "하루 충전 미션",
    건강: "루틴 체크 미션",
    패션: "새 스타일 공개 미션",
    IT가젯: "장비 레벨업 퀘스트",
    굿즈: "팬덤 보관함 미션",
  };
  return byCategory[analysis.category] || `${character.role} 성장 캠페인`;
}

function renderSharePreview(analysis) {
  const character = characters.find((item) => item.id === selectedCharacterId) || analysis.selected;
  const questName = getQuestName(character, analysis);
  const slug = `${character.id}-${slugify(analysis.brand)}-${slugify(analysis.product)}`;
  const targetNumber = parseInt(analysis.shareTarget, 10) || 500;
  const percent = Math.min(100, Math.round((progressCount / targetNumber) * 100));

  $("#shareUrl").textContent = `fanletter.ai/c/${slug}`;
  $("#avatarMark").textContent = character.mark;
  $("#shareTitle").textContent = `${character.name}의 ${questName}`;
  $("#shareBody").textContent = `팬들이 ${analysis.shareTarget} 목표를 달성하면 ${character.name}의 성장 스탯이 오르고 새 캠페인 브이로그가 열립니다.`;
  $("#progressText").textContent = `${progressCount} / ${targetNumber}`;
  $("#progressBar").style.width = `${percent}%`;
}

function renderAll() {
  latestAnalysis = buildAnalysis();
  renderProduct(latestAnalysis);
  renderCharacters(latestAnalysis);
  renderBrief(latestAnalysis);
  renderSharePreview(latestAnalysis);
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(showToast.timeout);
  showToast.timeout = setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2200);
}

function setApprovalStatus(status) {
  const badge = $("#approvalStatus");
  badge.classList.remove("is-pending", "is-active");
  if (status === "pending") {
    badge.textContent = "Pending Review";
    badge.classList.add("is-pending");
  } else if (status === "approved") {
    badge.textContent = "Approved";
    badge.classList.add("is-pending");
  } else if (status === "active") {
    badge.textContent = "Share Link Active";
    badge.classList.add("is-active");
  } else {
    badge.textContent = "Draft";
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const draft = await requestJson("/api/advertiser/campaigns/analyze", {
      method: "POST",
      body: JSON.stringify(buildPayload(true)),
    });
    applyServerDraft(draft);
    currentCampaign = null;
    progressCount = 0;
    setApprovalStatus("draft");
    renderAll();
    showToast("API로 상품 URL을 분석하고 캠페인 초안을 업데이트했습니다.");
  } catch (error) {
    hydrateProductFields();
    selectedCharacterId = getTopCharacterId(buildAnalysis());
    progressCount = 0;
    setApprovalStatus("draft");
    renderAll();
    showToast(error.message);
  }
});

$("#characterGrid").addEventListener("click", (event) => {
  const button = event.target.closest("[data-character-id]");
  if (!button) return;
  selectedCharacterId = button.dataset.characterId;
  renderAll();
  showToast("추천 캐릭터를 변경했습니다.");
});

$("#submitApprovalButton").addEventListener("click", async () => {
  try {
    currentCampaign = await requestJson("/api/advertiser/campaigns", {
      method: "POST",
      body: JSON.stringify(buildPayload(false)),
    });
    currentCampaign = await requestJson(`/api/advertiser/campaigns/${currentCampaign.id}/submit`, {
      method: "POST",
      body: JSON.stringify({}),
    });
    setApprovalStatus("pending");
    showToast("API에 캠페인을 저장하고 승인 요청 상태로 전환했습니다.");
  } catch (error) {
    showToast(error.message);
  }
});

$("#activateCampaignButton").addEventListener("click", async () => {
  try {
    if (!currentCampaign) {
      currentCampaign = await requestJson("/api/advertiser/campaigns", {
        method: "POST",
        body: JSON.stringify(buildPayload(false)),
      });
    }
    currentCampaign = await requestJson(`/api/admin/campaigns/${currentCampaign.id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: "active" }),
    });
    setApprovalStatus("active");
    renderSharePreview(latestAnalysis || buildAnalysis());
    showToast("테스트용으로 공유링크를 활성화했습니다.");
  } catch (error) {
    showToast(error.message);
  }
});

$("#copyShareButton").addEventListener("click", async () => {
  const link = $("#shareUrl").textContent;
  try {
    await navigator.clipboard.writeText(link);
    showToast("공유링크를 복사했습니다.");
  } catch {
    showToast(link);
  }
});

async function recordCampaignEvent(eventType, fallbackDelta, message) {
  try {
    if (!currentCampaign) {
      showToast("먼저 승인 요청 후 테스트 승인을 눌러 공유링크를 활성화하세요.");
      return;
    }
    const result = await requestJson(`/api/campaigns/${currentCampaign.shareSlug}/events`, {
      method: "POST",
      body: JSON.stringify({ eventType, source: "prototype_preview" }),
    });
    currentCampaign = result;
    progressCount = result.progressCount;
    setApprovalStatus(result.status);
    renderSharePreview(latestAnalysis || buildAnalysis());
    showToast(message);
  } catch (error) {
    if (error.message.includes("not active")) {
      showToast("공유링크가 아직 활성화되지 않았습니다. 테스트 승인을 먼저 누르세요.");
      return;
    }
    progressCount += fallbackDelta;
    renderSharePreview(latestAnalysis || buildAnalysis());
    showToast(error.message);
  }
}

$("#mockClickButton").addEventListener("click", () => {
  recordCampaignEvent("click", 25, "API에 상품 보기 이벤트가 기록되었습니다.");
});

$("#mockShareButton").addEventListener("click", () => {
  recordCampaignEvent("share", 75, "API에 공유 이벤트가 기록되었습니다.");
});

$("#resetButton").addEventListener("click", () => {
  productUrl.value = "https://brand.com/products/mini-air-cleaner";
  brandName.value = "Airly";
  productName.value = "미니 공기청정기";
  priceAmount.value = "49,000원";
  category.value = "생활가전";
  benefitText.value = "10% 쿠폰, 무료배송";
  requiredCopy.value = "작은 방과 책상 위 공간에 적합";
  prohibitedCopy.value = "질병 예방, 의학적 효능, 미세먼지 완전 제거 표현 금지";
  selectedCharacterId = "harin";
  progressCount = 0;
  currentCampaign = null;
  setApprovalStatus("draft");
  renderAll();
  showToast("초기 상태로 되돌렸습니다.");
});

for (const input of [brandName, productName, priceAmount, category, benefitText, requiredCopy, prohibitedCopy]) {
  input.addEventListener("input", renderAll);
  input.addEventListener("change", renderAll);
}

for (const radio of document.querySelectorAll('input[name="campaignGoal"]')) {
  radio.addEventListener("change", renderAll);
}

renderAll();
