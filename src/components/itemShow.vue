<template>
  <el-dialog width="85%" :model="show" title="">
    <el-row>
      <el-col :span="6">
        <div class="grid-content bg-purple">
          <img style="height: 100%" :src="sdata.item.icon" />
          <div>{{ sockets }}</div>
          <div v-if="sdata.item.properties">
            <div v-for="properties in sdata.item.properties" :key="properties">
              {{ properties.name
              }}{{
                properties.values.length ? ":" + properties.values[0][0] : ""
              }}
            </div>
          </div>
          <el-divider></el-divider>

          <div v-if="extended">
            {{ extended }}
          </div>
        </div>
      </el-col>
      <el-col :span="18">
        <div class="grid-content bg-purple-light">
          <el-container>
            <el-header height="auto">
              <div v-if="sdata.item.name">
                {{ sdata.item.name }}({{ frameType }}){{
                  sdata.item.corrupted
                    ? (sdata.item.scourgeMods ? "(天灾" : "(") + "腐化)"
                    : ""
                }}{{ influences ? influences : "" }}
              </div>
              <div v-if="sdata.item.baseType">{{ sdata.item.baseType }}</div>
              <div v-if="sdata.item.ilvl">物等:{{ sdata.item.ilvl }}</div>
              <div v-if="sdata.item.requirements">需求:{{ requirements }}</div>
            </el-header>
            <!-- <el-divider></el-divider> -->

            <el-main>
              <div v-if="sdata.item.scourgeMods">
                <div
                  v-for="scourgeMods in sdata.item.scourgeMods"
                  :key="scourgeMods"
                >
                  {{ scourgeMods }}
                </div>
                <el-divider></el-divider>
              </div>
              <div v-if="sdata.item.implicitMods">
                <div
                  v-for="implicitMod in sdata.item.implicitMods"
                  :key="implicitMod"
                >
                  {{ implicitMod }}
                </div>
                <el-divider></el-divider>
              </div>

              <div v-if="sdata.item.explicitMods">
                <div
                  v-for="explicitmods in sdata.item.explicitMods"
                  :key="explicitmods"
                >
                  {{ explicitmods }}
                </div>
              </div>
            </el-main>
            <el-footer>
              <div v-if="sdata.item.note">
                {{ sdata.item.note }}
              </div>
              <el-button
                v-if="sdata.fetchItem.domain == 1"
                type="text"
                @click="copyText"
                >市集搜索语句</el-button
              >
            </el-footer>
          </el-container>
        </div>
      </el-col>
    </el-row>
  </el-dialog>
</template>

<script>
const itemUtil = require("../utils/itemShow");
import { ElMessage } from "element-plus";

export default {
  components: {},
  props: {
    data: Object,
    show: Boolean,
  },
  data() {
    return {
      sdata: this.data,
      sockets: "",
      frameType: "",
      requirements: "",
      influences: "",
      extended: "",
    };
  },
  watch: {
    data: {
      handler(newData, oldData) {
        this.sdata = newData;
        this.sockets = "";
        this.frameType = "";
        this.requirements = "";
        this.influences = "";
        this.extended = "";
        let item = this.sdata.item;
        if (item.sockets) {
          this.genSockets();
        }
        if (item.frameType) {
          this.genFrameType();
        }
        if (item.requirements) {
          this.genRequirements();
        }
        if (item.influences) {
          this.genInfluences();
        }
        if (item.extended) {
          this.genExtended();
        }

        console.log(this.sdata);
      },
      deep: true,
    },
  },
  computed: {},
  methods: {
    copyText() {
      let text = "";
      if (this.sdata.item.note) {
        text += '"' + this.sdata.item.note + '" ';
      }
      if (this.sdata.item.name) {
        text += '"' + this.sdata.item.name + '" ';
      }

      if (this.sdata.item.ilvl) {
        text += '"ilvl: ' + this.sdata.item.ilvl + '" ';
      }
      let flag = false;
      if (this.sdata.item.extended) {
        if (this.sdata.item.extended.mods) {
          if (this.sdata.item.extended.mods.explicit) {
            this.sdata.item.extended.mods.explicit.forEach((element) => {
              if (element.name) {
                flag = true;
                text += '"' + element.name + '" ';
              }
            });
          }
        }
      }

      if (this.sdata.item.notableProperties) {
        this.sdata.item.notableProperties.forEach((element) => {
          flag = true;
          text += '"' + element.name + '" ';
        });
      }

      if (!flag && this.sdata.item.explicitMods) {
        this.sdata.item.explicitMods.forEach((element) => {
          text += '"' + element + '" ';
        });
      }

      this.$copyText(text).then(
        (e) => {
          ElMessage("复制成功");
        },
        (e) => {}
      );
    },
    genSockets() {
      let group = [];
      let socketsList = this.sdata.item.sockets;
      socketsList.forEach((socket) => {
        if (group.indexOf(socket.group) < 0) {
          group.push(socket.group);
        }
      });
      let sockets = "";
      group.forEach((groupIndex) => {
        let socketGroup = "";
        socketsList.forEach((socket) => {
          if (socket.group == groupIndex) {
            socketGroup += itemUtil.getColor(socket.sColour) + "-";
          }
        });
        socketGroup =
          socketGroup.length > 0
            ? socketGroup.substring(0, socketGroup.length - 1)
            : socketGroup;
        sockets += " " + socketGroup + " |";
      });
      this.sockets =
        sockets.length > 0 ? sockets.substring(0, sockets.length - 1) : sockets;
    },
    genFrameType() {
      this.frameType = itemUtil.getType(this.sdata.item.frameType);
    },
    genRequirements() {
      let requirements = "";
      this.sdata.item.requirements.forEach((req) => {
        requirements += req.name + ":" + req.values[0][0] + " ";
      });
      this.requirements = requirements;
    },
    genInfluences() {
      let influences = "";
      for (let inf in this.sdata.item.influences) {
        if (this.sdata.item.influences[inf]) {
          influences += " " + itemUtil.getInfluence(inf) + " |";
        }
      }
      this.influences =
        influences.length > 0
          ? influences.substring(0, influences.length - 1)
          : influences;
    },
    genExtended() {
      let extended = "";
      for (let name in this.sdata.item.extended) {
        if (name == "dps") {
          extended += "秒伤:" + this.sdata.item.extended[name] + "\n";
        }
        if (name == "edps") {
          extended += "元素伤:" + this.sdata.item.extended[name] + "\n";
        }
        if (name == "pdps") {
          extended += "物理伤:" + this.sdata.item.extended[name] + "\n";
        }
        if (name == "es") {
          extended += "护盾:" + this.sdata.item.extended[name] + "\n";
        }
        if (name == "ev") {
          extended += "闪避:" + this.sdata.item.extended[name] + "\n";
        }
        if (name == "ar") {
          extended += "护甲:" + this.sdata.item.extended[name] + "\n";
        }
      }
      this.extended =
        extended.length > 0
          ? extended.substring(0, extended.length - 1)
          : extended;
    },
  },
  created() {
    console.log(this.sdata);
  },
  mounted() {
    console.log(this.sdata);
  },
};
</script>
<style lang="scss" scoped></style>
