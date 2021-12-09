<template>
  <div class="common-layout"></div>
</template>

<script>
import store from "../store";
const spider = require("../utils/spider");
import { ElMessage } from "element-plus";
const itemUtil = require("../utils/itemShow");
import poeTxStat from "../assets/poeTxStat.json";
import poeItemType from "../assets/poeType.json";
import { Translate } from "../utils/translate";

export default {
  components: {},
  props: {},
  data() {
    return {
      frameTypes: [
        "Normal",
        "Magic",
        "Rare",
        "Unique",
        "Gem",
        "Currency",
        "DivinationCard",
        "Quest",
        "Prophecy",
        "Relic",
      ],
      influences: {
        shaper: "pseudo.pseudo_has_shaper_influence",
        elder: "pseudo.pseudo_has_elder_influence",
        crusader: "pseudo.pseudo_has_crusader_influence",
        redeemer: "pseudo.pseudo_has_redeemer_influence",
        hunter: "pseudo.pseudo_has_hunter_influence",
        warlord: "pseudo.pseudo_has_warlord_influence",
      },
      txExplicit: {},
      formData: [
        {
          address: "http://127.0.0.1:10809",
          username: "",
          password: "",
        },
      ],
      searchJson_Def: {
        query: {
          status: {
            option: "online",
          },
          stats: [
            {
              type: "and",
              filters: [],
            },
          ],
          filters: {
            trade_filters: {
              filters: {
                sale_type: {
                  option: "priced",
                },
                price: {
                  min: 0.1,
                  max: null,
                },
                collapse: {},
              },
            },
            misc_filters: {
              filters: {},
            },
            socket_filters: {
              filters: {},
            },
            type_filters: {
              filters: {},
            },
            map_filters: {
              filters: {},
            },
          },
        },
        sort: {
          price: "asc",
        },
      },
    };
  },
  watch: {},
  computed: {},
  methods: {
    dealInfluence(item) {
      let that = this;
      for (const key in item.influences) {
        if (Object.hasOwnProperty.call(item.influences, key)) {
          const flag = item.influences[key];
          if (flag) {
            that.searchJson_Def.query.stats[0].filters.push({
              id: that.influences[key],
            });
          }
        }
      }
    },
    dealMisc(item) {
      let that = this;
      let miscfilters = that.searchJson_Def.query.filters.misc_filters.filters;
      item.ilvl && (miscfilters["ilvl"] = { min: item.ilvl });
    },
    dealSocket(item) {
      let socketfilters =
        this.searchJson_Def.query.filters.socket_filters.filters;
      item.sockets &&
        item.sockets.filter((socket) => {
          return socket.group == 0;
        }).length == 6 &&
        (socketfilters["links"] = { min: 6 });
    },
    dealExplicitMods(item) {
      let that = this;
      item.explicitMods.forEach((mod) => {
        that.txExplicit.forEach((explicit) => {
          let reg = new RegExp(
            explicit.text
              .replaceAll(" ", "")
              .replaceAll("+", "\\+")
              .replaceAll(".", "\\.")
              .replaceAll("#%", ".*")
              .replaceAll("#", ".*"),
            "g"
          );
          if (mod.replace(reg, "").length == 0) {
            that.searchJson_Def.query.stats[0].filters.push({
              id: explicit.id,
              disabled: false,
              value: { min: 1 },
            });
          }
        });
      });
    },
    dealTypeFilters(item){
        let that = this;
        this.itemTypes.forEach(itemType => {
            let text = itemType.text.replaceAll(" ", "").replaceAll("-", "")
            
        });

    }
  },
  created() {
    this.txExplicit = poeTxStat.result.filter((data) => {
      return data.label == Translate["explicit"];
    })[0].entries;
    this.itemTypes = poeItemType

    var item = {
      verified: false,
      w: 2,
      h: 2,
      icon: "https://poecdn.game.qq.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQXJtb3Vycy9HbG92ZXMvR2xvdmVzU3RyRGV4MiIsInciOjIsImgiOjIsInNjYWxlIjoxfV0/0bb5dd1e50/GlovesStrDex2.png",
      league: "S17赛季",
      id: "271f8e4bf5aed656f34a1f30349dca480e55edcf9c76c5d85d5879cfedf2b6af",
      influences: {
        warlord: true,
      },
      sockets: [
        {
          group: 0,
          attr: "S",
          sColour: "R",
        },
        {
          group: 0,
          attr: "S",
          sColour: "R",
        },
        {
          group: 1,
          attr: "S",
          sColour: "R",
        },
      ],
      name: "邪风 爪锋",
      typeLine: "火蝮鳞手套",
      baseType: "火蝮鳞手套",
      identified: true,
      ilvl: 84,
      properties: [
        {
          name: "护甲",
          values: [["114", 0]],
          displayMode: 0,
          type: 16,
        },
        {
          name: "闪避值",
          values: [["114", 0]],
          displayMode: 0,
          type: 17,
        },
      ],
      requirements: [
        {
          name: "等级",
          values: [["59", 0]],
          displayMode: 0,
        },
        {
          name: "力量",
          values: [["45", 0]],
          displayMode: 1,
        },
        {
          name: "敏捷",
          values: [["45", 0]],
          displayMode: 1,
        },
      ],
      explicitMods: [
        "近战伤害提高 27%",
        "+49 最大生命",
        "物品稀有度提高 8%",
        "+38% 冰霜抗性",
      ],
      frameType: 2,
      x: 10,
      y: 10,
      inventoryId: "Stash7",
      socketedItems: [],
    };
    item.frameType &&
      item.frameType > 2 &&
      (this.searchJson_Def.query.name = item.name) &&
      (this.searchJson_Def.query.type = item.baseType
        ? item.baseType
        : item.typeLine) &&
      (this.searchJson_Def.query.filters.type_filters.filters["rarity"] = {
        option: this.frameTypes[item.frameType],
      });

    this.dealInfluence(item);
    this.dealMisc(item);
    this.dealSocket(item);
    item.explicitMods && this.dealExplicitMods(item);

    console.log(this.searchJson_Def);
  },
  mounted() {},
};
</script>
<style lang="scss" scoped></style>
