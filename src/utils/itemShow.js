const a = {
  Currency: 5,
  DivinationCard: 6,
  Gem: 4,
  Magic: 1,
  Normal: 0,
  Prophecy: 8,
  Quest: 7,
  Rare: 2,
  Relic: 9,
  Unique: 3,
};

export { getColor, getType,getInfluence };

function getInfluence(Influence) {
  let o;
  switch (Influence) {
    default:
    case "crusader":
    case "Crusader":
      o = "圣战者";
      break;
    case "Shaper":
    case "shaper":
      o = "塑界者";
      break;
    case "elder":
    case "Elder":
      o = "裂界者";
      break;
    case "redeemer":
    case "Redeemer":
      o = "救赎者";
      break;
    case "hunter":
    case "Hunter":
      o = "狩猎者";
      break;
    case "warlord":
    case "Warlord":
      o = "督军";
      break;
  }
  return o;
}

function getColor(color) {
  let o;
  switch (color) {
    default:
    case "G":
      o = "绿";
      break;
    case "W":
      o = "白";
      break;
    case "R":
      o = "红";
      break;
    case "B":
      o = "蓝";
      break;
    case "A":
      o = "深渊";
      break;
  }
  return o;
}

function getType(frameType) {
  let o;
  switch (frameType) {
    default:
    case a.Normal:
    case "Normal":
      o = "普通";
      break;
    case a.Magic:
    case "Magic":
      o = "魔法";
      break;
    case a.Rare:
    case "Rare":
      o = "稀有";
      break;
    case a.Unique:
    case "Unique":
      o = "传奇";
      break;
    case a.Gem:
    case "Gem":
      o = "宝石";
      break;
    case a.Currency:
    case "Currency":
      o = "通货";
      break;
    case a.Quest:
    case "Quest":
      o = "探索 解密";
      break;
    case a.DivinationCard:
    case "DivinationCard":
      o = "命运卡";
      break;
    case a.Prophecy:
    case "Prophecy":
      o = "预言";
      break;
    case a.Relic:
    case "Relic":
      o = "废墟(遗产)";
  }
  return o;
}
