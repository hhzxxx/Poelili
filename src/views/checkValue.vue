<template>
  <div class="common-layout">
    <el-form style="padding: 0 10%" ref="form" :model="formData">
      <el-form-item size="mini" label="">
        <el-select fit-input-width="true" v-model="formData.domain" placeholder="serve">
          <el-option v-for="(item, index1) in serves" :key="index1" :label="item" :value="index1 + 1"></el-option>
        </el-select>
        <el-select fit-input-width="true" v-model="formData.league" placeholder="league">
          <el-option v-for="(item, index1) in leagues[formData.domain]" :key="index1" :label="item.id" :value="item.id"></el-option>
        </el-select>

        <el-select fit-input-width="true" v-model="searchJson_Def.query.status.option" placeholder="状态">
          <el-option label="在线" value="online"></el-option>
          <el-option label="任何" value="any"></el-option>
        </el-select>
        <el-button type="primary" @click="test()">test</el-button>
      </el-form-item>
      <el-form-item size="mini" label="">
        <el-input style="width: 200px" v-model="searchJson_Def.query.type" placeholder="min">
          <template #prepend><div style="width: 40px">基础类别</div></template>
        </el-input>
      </el-form-item>

      <div v-if="searchJson_Def.query.filters">
        <el-form-item v-if="searchJson_Def.query.filters.misc_filters.filters.gem_level" size="mini" label="">
          <el-input style="width: 130px" v-model="searchJson_Def.query.filters.misc_filters.filters.gem_level.min" placeholder="min">
            <template #prepend><div style="width: 40px">宝石等级</div></template>
          </el-input>
          <el-input
            style="width: 60px"
            v-model="searchJson_Def.query.filters.misc_filters.filters.gem_level.max"
            placeholder="max"
          ></el-input>
          <el-switch
            v-model="searchJson_Def.query.filters.misc_filters.filters.gem_level.disabled"
            :active-value="false"
            :inactive-value="true"
          />

          <el-input style="width: 130px" v-model="searchJson_Def.query.filters.misc_filters.filters.quality.min" placeholder="min">
            <template #prepend><div style="width: 40px">品质</div></template>
          </el-input>
          <el-input
            style="width: 60px"
            v-model="searchJson_Def.query.filters.misc_filters.filters.quality.max"
            placeholder="max"
          ></el-input>
          <el-switch
            v-model="searchJson_Def.query.filters.misc_filters.filters.quality.disabled"
            :active-value="false"
            :inactive-value="true"
          />

          <el-select
            style="width:90px"
            v-model="searchJson_Def.query.filters.misc_filters.filters.gem_alternate_quality.option"
            placeholder="league"
          >
            <el-option v-for="(item, index) in gem_alternate_quality_list" :key="index" :label="item.text" :value="item.id"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item v-if="searchJson_Def.query.filters.misc_filters.filters.ilvl">
          <el-input style="width: 200px" v-model="searchJson_Def.query.filters.misc_filters.filters.ilvl.min" placeholder="min">
            <template #prepend><div style="width: 40px">物品等级</div></template>
          </el-input>
          <el-input style="width: 70px" v-model="searchJson_Def.query.filters.misc_filters.filters.ilvl.max" placeholder="max"></el-input>
          <el-switch
            v-model="searchJson_Def.query.filters.misc_filters.filters.ilvl.disabled"
            :active-value="false"
            :inactive-value="true"
          />
        </el-form-item>
        <el-form-item size="mini" label="">
          <div style="display: flex" v-for="(item, index) in searchJson_Def.query.stats[0].filters" :key="index">
            <el-input v-model="item.value.min" placeholder="min">
              <template #prepend
                ><div style="width: 420px">
                  <i style="float: left">{{ item.type }}</i
                  >{{ item.title }}
                </div></template
              >
            </el-input>
            <el-input style="width: 70px" v-model="item.value.max" placeholder="max"></el-input>
            <el-switch v-model="item.disabled" :active-value="false" :inactive-value="true" />
          </div>
        </el-form-item>
      </div>
    </el-form>
  </div>
</template>

<script>
import store from "../store"
const spider = require("../utils/spider")
import { ElMessage, useFormItemProps } from "element-plus"
const MathUtils = require("../utils/MathUtils")
const itemUtil = require("../utils/itemShow")
import poeTxStat from "../assets/poeTxStat.json"
import poeItemType from "../assets/poeType.json"
import { Translate } from "../utils/translate"
import e from "express"

export default {
  components: {},
  props: {},
  data() {
    return {
      enchantMods: [],
      formData: {
        domain: "",
        league: "",
      },
      leagues: {},
      serves: ["腾讯", "国际"],
      frameTypes: ["Normal", "Magic", "Rare", "Unique", "Gem", "Currency", "DivinationCard", "Quest", "Prophecy", "Relic"],
      gem_alternate_quality_list: [
        {
          id: "0",
          text: "精良的（默认）",
        },
        {
          id: "alternate",
          text: "任何替换",
        },
        {
          id: "1",
          text: "异常",
        },
        {
          id: "2",
          text: "分歧",
        },
        {
          id: "3",
          text: "魅影",
        },
      ],
      rarities: [
        {
          id: null,
          text: Translate["Any"],
        },
        {
          id: "normal",
          text: Translate["Normal"],
        },
        {
          id: "magic",
          text: Translate["Magic"],
        },
        {
          id: "rare",
          text: Translate["Rare"],
        },
        {
          id: "unique",
          text: Translate["Unique"],
        },
        {
          id: "uniquefoil",
          text: Translate["Unique (Relic)"],
        },
        {
          id: "nonunique",
          text: Translate["Any Non-Unique"],
        },
      ],
      influences: {
        shaper: "pseudo.pseudo_has_shaper_influence",
        elder: "pseudo.pseudo_has_elder_influence",
        crusader: "pseudo.pseudo_has_crusader_influence",
        redeemer: "pseudo.pseudo_has_redeemer_influence",
        hunter: "pseudo.pseudo_has_hunter_influence",
        warlord: "pseudo.pseudo_has_warlord_influence",
      },
      txexplicit: {},
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
                price: {
                  min: 0.1,
                  max: null,
                },
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
    }
  },
  watch: {},
  computed: {},
  methods: {
    test() {
      spider.query({ query: this.searchJson_Def, data: this.formData }).then((res) => {
        if (res.data) {
          spider.getItemsByList(this.formData, res.data.fetchID[0]).then((res) => {
            ElMessage("获取成功")
            console.log(res)
          })
        }
      })
    },
    dealInfluence(item) {
      let that = this
      for (const key in item.influences) {
        if (Object.hasOwnProperty.call(item.influences, key)) {
          const flag = item.influences[key]
          if (flag) {
            that.searchJson_Def.query.stats[0].filters.push({
              id: that.influences[key],
            })
          }
        }
      }
    },
    dealMisc(item) {
      let that = this
      let miscfilters = that.searchJson_Def.query.filters.misc_filters.filters
      item.ilvl && (miscfilters["ilvl"] = { min: item.ilvl })
    },
    dealSocket(item) {
      let socketfilters = this.searchJson_Def.query.filters.socket_filters.filters
      item.sockets &&
        item.sockets.filter((socket) => {
          return socket.group == 0
        }).length == 6 &&
        (socketfilters["links"] = { min: 6 })
    },
    //enchant
    dealMods(item, modeType) {
      let that = this
      let list1 = []
      item[modeType + "Mods"].forEach((mod) => {
        let list = []
        that["tx" + modeType].forEach((modeJson) => {
          let rate = MathUtils.strSimilarity2Percent(modeJson.text, mod)
          if (rate > 0.3) {
            list.push({
              rate: rate,
              id: modeJson.id,
              title: modeJson.text,
            })
          }
        })
        list1.push(list)
      })
      list1.forEach((list) => {
        if (list.length > 0) {
          list.sort((a, b) => b.rate - a.rate)
          that.searchJson_Def.query.stats[0].filters.push({
            id: list[0].id,
            title: list[0].title,
            disabled: true,
            value: { min: 1 },
            type: Translate[modeType],
          })
          console.log(list[0])
        }
      })
    },
    dealTypeFilters(item) {
      let that = this
      let iconType = item.icon.split("/")
      iconType = iconType[iconType.length - 1]
      let flag = false
      this.itemTypes.forEach((itemType) => {
        let text = itemType.text.replaceAll(" ", "").replaceAll("-", "").replaceAll("Handed", "Hand")
        let reg = new RegExp("^" + text, "i")
        if (reg.test(iconType)) {
          flag = true
          that.searchJson_Def.query.filters.type_filters.filters = {
            category: {
              option: itemType.id,
            },
          }
        }
      })
      if (!flag && item.baseType) {
        that.searchJson_Def.query.type = item.baseType
      }
    },
    dealGem(item) {
      let that = this
      item.properties.forEach((element) => {
        if (element.name == "等级") {
          that.searchJson_Def.query.filters.misc_filters.filters["gem_level"] = {
            min: element.values[0][0].match(/\d+/)[0],
          }
        }
        if (element.name == "品质") {
          that.searchJson_Def.query.filters.misc_filters.filters["quality"] = {
            min: element.values[0][0].match(/\d+/)[0],
          }
        }
      })
      that.gem_alternate_quality_list.forEach((element) => {
        if (item.typeLine.indexOf(element.text) > -1) {
          that.searchJson_Def.query.filters.misc_filters.filters["gem_alternate_quality"] = {
            option: element.id,
          }
        }
      })
    },
  },
  created() {
    if (store.has("leagues") && store.get("leagues.1") && store.get("leagues.2")) {
      this.leagues = store.get("leagues")
    } else {
      spider.initTxLeagues().then((res) => {
        this.leagues[1] = res
      })
      spider.initGJLeagues().then((res) => {
        this.leagues[2] = res
      })
    }
    poeTxStat.result.forEach((element) => {
      if (element.label == Translate["explicit"]) {
        this.txexplicit = element.entries
      }
      if (element.label == Translate["enchant"]) {
        this.txenchant = element.entries
      }
      if (element.label == Translate["implicit"]) {
        this.tximplicit = element.entries
      }
    })
    this.itemTypes = poeItemType

    var item = {
      verified: false,
      w: 1,
      h: 1,
      icon: "https://poecdn.game.qq.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvR2Vtcy9MaWdodG5pbmdHb2xlbSIsInciOjEsImgiOjEsInNjYWxlIjoxLCJzcGVjdHJhbCI6dHJ1ZX1d/4d0eb8f9c2/LightningGolem.png",
      support: false,
      league: "S17赛季",
      id: "aa17921f3d72c5957c7855fdd838ea9620dc344f4044c449a277a627d4cd6f87",
      name: "",
      typeLine: "异常 召唤闪电魔像",
      baseType: "召唤闪电魔像",
      identified: true,
      ilvl: 0,
      properties: [
        {
          name: "闪电, 召唤生物, 法术, 魔像",
          values: [],
          displayMode: 0,
        },
        {
          name: "等级",
          values: [["19", 0]],
          displayMode: 0,
          type: 5,
        },
        {
          name: "消耗",
          values: [["54 点魔力", 0]],
          displayMode: 0,
        },
        {
          name: "冷却时间",
          values: [["6.00 秒", 0]],
          displayMode: 0,
        },
        {
          name: "施放时间",
          values: [["1.00 秒", 0]],
          displayMode: 0,
        },
        {
          name: "品质",
          values: [["+20%", 1]],
          displayMode: 0,
          type: 6,
        },
        {
          name: "",
          values: [["替换品质", 0]],
          displayMode: 0,
        },
      ],
      requirements: [
        {
          name: "等级",
          values: [["69", 0]],
          displayMode: 0,
        },
        {
          name: "敏捷",
          values: [["67", 0]],
          displayMode: 1,
        },
        {
          name: "智慧",
          values: [["96", 0]],
          displayMode: 1,
        },
      ],
      additionalProperties: [
        {
          name: "经验值",
          values: [["113794422 / 157972052", 0]],
          displayMode: 2,
          progress: 0.72,
          type: 20,
        },
      ],
      secDescrText:
        "召唤一个闪电魔像, 给予你额外的攻击和施法速度. 魔像会对敌人进行雷击, 召唤会对电击敌人的能量球, 偶尔施放一个攻击魔像附近的敌人时附加额外闪电伤害的光环. ",
      explicitMods: ["最多召唤 1 个魔像", "召唤生物最大生命提高 66%", "魔像会使玩家的攻击与施法速度提高 9%", "增益效果提高 20%"],
      descrText: "将其放置于物品上同样颜色的插槽来获得这项技能。点击右键从插槽中移除。",
      frameType: 4,
      x: 11,
      y: 3,
      inventoryId: "Stash7",
    }
    if (item.icon.indexOf("game.qq.com") > 0) {
      this.formData.domain = 1
    }
    if (item.league) {
      this.formData.league = item.league
    }
    item.frameType &&
      item.frameType > 2 &&
      (item.name ? (this.searchJson_Def.query.name = item.name) : "") &&
      (this.searchJson_Def.query.type = item.baseType)

    this.dealInfluence(item)
    this.dealMisc(item)
    this.dealSocket(item)
    item.implicitMods && this.dealMods(item, "implicit") //基底
    item.enchantMods && this.dealMods(item, "enchant") //附魔
    item.explicitMods && this.dealMods(item, "explicit") //外延

    item.frameType == 4 && this.dealGem(item) //宝石

    item.icon && this.dealTypeFilters(item)
    console.log(this.searchJson_Def)
  },
  mounted() {},
}
</script>
<style lang="scss" scoped>
.el-input-group__prepend {
  width: 350px !important;
}
</style>
