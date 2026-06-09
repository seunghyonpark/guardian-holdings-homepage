const slug = decodeURIComponent(window.location.pathname.replace(/^\/c\//, ""));
let campaign = null;

const $ = (selector) => document.querySelector(selector);

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error?.message || "요청에 실패했습니다.");
  }
  return payload;
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

function getTargetNumber(shareTarget) {
  return parseInt(shareTarget, 10) || 500;
}

function renderCampaign(nextCampaign) {
  campaign = nextCampaign;
  const targetNumber = getTargetNumber(campaign.analysis.shareTarget);
  const percent = Math.min(100, Math.round((campaign.progressCount / targetNumber) * 100));

  document.title = `${campaign.selectedCharacter.name}의 ${campaign.questName} | FanLetter`;
  $("#publicAvatar").textContent = campaign.selectedCharacter.mark;
  $("#publicStatus").textContent =
    campaign.status === "active" ? "공유링크 활성" : "승인 대기 중";
  $("#publicTitle").textContent = `${campaign.selectedCharacter.name}의 ${campaign.questName}`;
  $("#publicLead").textContent = campaign.brief.storyHook;
  $("#publicCategory").textContent = campaign.product.category;
  $("#publicProduct").textContent = `${campaign.product.brand} ${campaign.product.name}`;
  $("#publicBenefit").textContent = campaign.product.benefit || "캠페인 혜택";
  $("#publicProgressText").textContent = `${campaign.progressCount} / ${targetNumber}`;
  $("#publicProgressBar").style.width = `${percent}%`;
  $("#publicNote").textContent = campaign.brief.complianceCopy;
}

async function loadCampaign() {
  try {
    const nextCampaign = await requestJson(`/api/campaigns/${encodeURIComponent(slug)}`);
    renderCampaign(nextCampaign);
  } catch (error) {
    $("#publicStatus").textContent = "캠페인 없음";
    $("#publicTitle").textContent = "공유 캠페인을 찾을 수 없습니다";
    $("#publicLead").textContent = error.message;
    $("#publicProductButton").disabled = true;
    $("#publicShareButton").disabled = true;
  }
}

async function recordEvent(eventType, message) {
  if (!campaign) return;
  if (campaign.status !== "active") {
    showToast("아직 활성화되지 않은 캠페인입니다.");
    return;
  }

  try {
    const nextCampaign = await requestJson(`/api/campaigns/${encodeURIComponent(slug)}/events`, {
      method: "POST",
      body: JSON.stringify({ eventType, source: "public_share_page" }),
    });
    renderCampaign(nextCampaign);
    showToast(message);
  } catch (error) {
    showToast(error.message);
  }
}

$("#publicProductButton").addEventListener("click", () => {
  recordEvent("click", "상품 보기 이벤트가 기록되었습니다.");
});

$("#publicShareButton").addEventListener("click", async () => {
  await recordEvent("share", "공유 이벤트가 기록되었습니다.");
  try {
    await navigator.clipboard.writeText(window.location.href);
  } catch {
    // Clipboard permission can be unavailable in some browsers.
  }
});

loadCampaign();
