import { createReadStream, existsSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "node:http";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const port = Number(process.env.PORT || 4173);

const characters = [
  {
    id: "harin",
    name: "하린",
    mark: "하",
    role: "자취 생활 캐릭터",
    categories: ["생활가전", "식품", "굿즈"],
    baseScore: 74,
  },
  {
    id: "mina",
    name: "미나",
    mark: "미",
    role: "뷰티 큐레이터",
    categories: ["뷰티", "건강", "패션"],
    baseScore: 70,
  },
  {
    id: "ido",
    name: "이도",
    mark: "이",
    role: "IT 리뷰어",
    categories: ["IT가젯", "생활가전"],
    baseScore: 72,
  },
  {
    id: "yoonseo",
    name: "윤서",
    mark: "윤",
    role: "아이돌 연습생",
    categories: ["패션", "뷰티", "굿즈"],
    baseScore: 68,
  },
  {
    id: "doyun",
    name: "도윤",
    mark: "도",
    role: "운동 루틴 코치",
    categories: ["건강", "식품", "패션"],
    baseScore: 69,
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

const campaigns = new Map();
const campaignsBySlug = new Map();
const campaignEvents = [];
let nextCampaignId = 1;

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml; charset=utf-8",
};

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(payload));
}

function sendError(res, statusCode, message, details = undefined) {
  sendJson(res, statusCode, { error: { message, details } });
}

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (chunks.length === 0) return {};
  const raw = Buffer.concat(chunks).toString("utf8");
  return JSON.parse(raw);
}

function inferFromUrl(url) {
  const lowered = decodeURIComponent(url || "").toLowerCase();
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

  return (
    presets.find((preset) => preset.keys.some((key) => lowered.includes(key))) || {
      category: "생활가전",
      product: "미니 공기청정기",
      brand: "Airly",
      price: "49,000원",
    }
  );
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

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function getGoalLabel(goal) {
  return {
    click: "클릭",
    coupon: "쿠폰",
    purchase: "구매",
    live_view: "라방 유입",
  }[goal] ?? "클릭";
}

function getQuestName(category, character) {
  const byCategory = {
    생활가전: "방 업그레이드 퀘스트",
    뷰티: "루틴 실험 퀘스트",
    식품: "하루 충전 미션",
    건강: "루틴 체크 미션",
    패션: "새 스타일 공개 미션",
    IT가젯: "장비 레벨업 퀘스트",
    굿즈: "팬덤 보관함 미션",
  };
  return byCategory[category] || `${character.role} 성장 캠페인`;
}

function buildDraft(input) {
  const inferred = inferFromUrl(input.productUrl);
  const forceInfer = Boolean(input.forceInfer);
  const category = forceInfer ? inferred.category : input.category || inferred.category;
  const profile = categoryProfiles[category] || categoryProfiles["생활가전"];
  const goal = input.campaignGoal || "click";
  const analysis = {
    category,
    goal,
    type: profile.type,
    audience: profile.audience,
    motivation: profile.motivation,
    growth: profile.growth,
    risk: profile.risk,
    summary: profile.summary,
    shareTarget: goal === "live_view" ? "300 라방 유입" : goal === "purchase" ? "50 구매" : "500 클릭",
  };
  const matches = characters
    .map((character) => {
      const score = scoreCharacter(character, analysis);
      const matched = character.categories.includes(category);
      return {
        character,
        fitScore: score,
        fitReason: matched
          ? `${category} 상품을 ${character.role}의 성장 퀘스트로 자연스럽게 연결할 수 있습니다.`
          : `${character.name} 캐릭터는 직접 카테고리 적합도는 낮지만, 팬 미션이나 쿠폰 캠페인으로 테스트 가능합니다.`,
        riskNotes: analysis.risk === "높음" ? "운영자 수동 검수 필요" : "일반 검수",
      };
    })
    .sort((a, b) => b.fitScore - a.fitScore);

  const selectedCharacter =
    !forceInfer && input.selectedCharacterId
      ? characters.find((character) => character.id === input.selectedCharacterId) || matches[0].character
      : matches[0].character;
  const questName = getQuestName(category, selectedCharacter);
  const goalPhrase =
    goal === "live_view"
      ? "라방 알림을 받고"
      : goal === "coupon"
        ? "쿠폰을 받고"
        : goal === "purchase"
          ? "상품을 확인하고"
          : "공유링크에 참여하고";
  const product = {
    url: input.productUrl || "",
    brand: forceInfer ? inferred.brand : input.brandName || inferred.brand,
    name: forceInfer ? inferred.product : input.productName || inferred.product,
    price: forceInfer ? inferred.price : input.priceAmount || inferred.price,
    category,
    benefit: input.benefitText || "혜택 입력 필요",
    requiredCopy: input.requiredCopy || "",
    prohibitedCopy: input.prohibitedCopy || "",
  };
  const benefitPhrase = product.benefit === "혜택 입력 필요" ? "캠페인 혜택" : product.benefit;

  return {
    product,
    analysis,
    matches,
    selectedCharacter,
    questName,
    goalLabel: getGoalLabel(goal),
    brief: {
      storyHook: `${selectedCharacter.name} 캐릭터가 ${product.name} 상품을 경험하며 ${questName}를 진행합니다. 팬들이 ${goalPhrase} 목표를 달성하면 캐릭터 성장 로그에 반영됩니다.`,
      shareCopy: `${selectedCharacter.name}의 ${questName}에 참여하고 ${product.brand} ${product.name} ${benefitPhrase}을 확인해보세요.`,
      complianceCopy: `광고 및 AI 캐릭터 콘텐츠 표시가 필요합니다. 금지 문구: ${
        product.prohibitedCopy || "브랜드 검수 전 과장 표현 금지"
      }`,
    },
    shareSlug: `${selectedCharacter.id}-${slugify(product.brand)}-${slugify(product.name)}`,
  };
}

function serializeCampaign(campaign) {
  const events = campaignEvents.filter((event) => event.campaignId === campaign.id);
  const progressCount = events.reduce((sum, event) => sum + event.progressDelta, 0);
  return {
    ...campaign,
    events,
    progressCount,
    report: aggregateEvents(events),
  };
}

function aggregateEvents(events) {
  return events.reduce(
    (report, event) => {
      report.total += 1;
      report.byType[event.eventType] = (report.byType[event.eventType] || 0) + 1;
      report.progressCount += event.progressDelta;
      return report;
    },
    { total: 0, byType: {}, progressCount: 0 },
  );
}

function getProgressDelta(eventType) {
  return {
    impression: 0,
    click: 25,
    share: 75,
    coupon_download: 60,
    purchase: 100,
    live_view: 50,
    signup: 80,
  }[eventType] ?? 0;
}

function createCampaign(input) {
  const draft = buildDraft(input);
  const id = `pc_${String(nextCampaignId++).padStart(4, "0")}`;
  const now = new Date().toISOString();
  const campaign = {
    id,
    advertiserId: "adv_demo",
    characterId: draft.selectedCharacter.id,
    status: "draft",
    createdAt: now,
    updatedAt: now,
    approvedAt: null,
    publishedAt: null,
    ...draft,
  };
  campaigns.set(id, campaign);
  campaignsBySlug.set(campaign.shareSlug, id);
  return campaign;
}

function updateCampaignStatus(id, status) {
  const campaign = campaigns.get(id);
  if (!campaign) return null;

  const now = new Date().toISOString();
  campaign.status = status;
  campaign.updatedAt = now;
  if (status === "approved" || status === "active") {
    campaign.approvedAt = campaign.approvedAt || now;
  }
  if (status === "active") {
    campaign.publishedAt = campaign.publishedAt || now;
  }
  return campaign;
}

async function handleApi(req, res, url) {
  try {
    if (req.method === "GET" && url.pathname === "/api/health") {
      return sendJson(res, 200, { ok: true, campaigns: campaigns.size, events: campaignEvents.length });
    }

    if (req.method === "GET" && url.pathname === "/api/catalog/characters") {
      return sendJson(res, 200, { characters });
    }

    if (req.method === "POST" && url.pathname === "/api/advertiser/campaigns/analyze") {
      const body = await readJsonBody(req);
      return sendJson(res, 200, buildDraft(body));
    }

    if (req.method === "POST" && url.pathname === "/api/advertiser/campaigns") {
      const body = await readJsonBody(req);
      const campaign = createCampaign(body);
      return sendJson(res, 201, serializeCampaign(campaign));
    }

    const submitMatch = url.pathname.match(/^\/api\/advertiser\/campaigns\/([^/]+)\/submit$/);
    if (req.method === "POST" && submitMatch) {
      const campaign = updateCampaignStatus(submitMatch[1], "pending_admin");
      if (!campaign) return sendError(res, 404, "Campaign not found");
      return sendJson(res, 200, serializeCampaign(campaign));
    }

    const reportMatch = url.pathname.match(/^\/api\/advertiser\/campaigns\/([^/]+)\/report$/);
    if (req.method === "GET" && reportMatch) {
      const campaign = campaigns.get(reportMatch[1]);
      if (!campaign) return sendError(res, 404, "Campaign not found");
      return sendJson(res, 200, serializeCampaign(campaign).report);
    }

    const adminStatusMatch = url.pathname.match(/^\/api\/admin\/campaigns\/([^/]+)\/status$/);
    if (req.method === "PATCH" && adminStatusMatch) {
      const body = await readJsonBody(req);
      const allowed = new Set(["draft", "pending_admin", "approved", "active", "paused", "completed", "rejected"]);
      if (!allowed.has(body.status)) return sendError(res, 400, "Invalid campaign status");
      const campaign = updateCampaignStatus(adminStatusMatch[1], body.status);
      if (!campaign) return sendError(res, 404, "Campaign not found");
      return sendJson(res, 200, serializeCampaign(campaign));
    }

    const publicCampaignMatch = url.pathname.match(/^\/api\/campaigns\/([^/]+)$/);
    if (req.method === "GET" && publicCampaignMatch) {
      const shareSlug = decodeURIComponent(publicCampaignMatch[1]);
      const campaignId = campaignsBySlug.get(shareSlug);
      const campaign = campaignId ? campaigns.get(campaignId) : null;
      if (!campaign) return sendError(res, 404, "Campaign not found");
      return sendJson(res, 200, serializeCampaign(campaign));
    }

    const eventMatch = url.pathname.match(/^\/api\/campaigns\/([^/]+)\/events$/);
    if (req.method === "POST" && eventMatch) {
      const shareSlug = decodeURIComponent(eventMatch[1]);
      const campaignId = campaignsBySlug.get(shareSlug);
      const campaign = campaignId ? campaigns.get(campaignId) : null;
      if (!campaign) return sendError(res, 404, "Campaign not found");
      if (campaign.status !== "active") return sendError(res, 409, "Campaign share link is not active");

      const body = await readJsonBody(req);
      const eventType = body.eventType || "click";
      const event = {
        id: `ce_${String(campaignEvents.length + 1).padStart(5, "0")}`,
        campaignId: campaign.id,
        characterId: campaign.characterId,
        eventType,
        eventValue: Number(body.eventValue || 0),
        source: body.source || "share_page",
        progressDelta: getProgressDelta(eventType),
        createdAt: new Date().toISOString(),
      };
      campaignEvents.push(event);
      return sendJson(res, 201, serializeCampaign(campaign));
    }

    return sendError(res, 404, "API route not found");
  } catch (error) {
    return sendError(res, 500, "API error", error.message);
  }
}

async function serveStatic(req, res, url) {
  const pathname = url.pathname === "/" ? "/index.html" : url.pathname;
  const normalizedPath = normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, "");
  const filePath = join(__dirname, normalizedPath);

  if (!filePath.startsWith(__dirname) || !existsSync(filePath)) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
    return;
  }

  const type = contentTypes[extname(filePath)] || "application/octet-stream";
  res.writeHead(200, { "Content-Type": type });
  createReadStream(filePath).pipe(res);
}

createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  if (url.pathname.startsWith("/api/")) {
    await handleApi(req, res, url);
    return;
  }

  await serveStatic(req, res, url);
}).listen(port, () => {
  console.log(`FanLetter campaign prototype running at http://localhost:${port}`);
});
