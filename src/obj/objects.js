module.exports = {
    ItemDate,
    CaiMoGuItem
};

function ItemDate() {
    this.code = "";
    this.name = "";
    this.domain = "1";
    this.league = "";
    this.listenPrice = "";
    this.averagePrice = 0;
    this.dialogFormVisible = true;
}

function CaiMoGuItem() {
  this.itemId = 0;
  this.league = "";
  this.content = "";
  this.price = "";
  this.priceType = "";
  this.priceIcon = "";
  this.status = "0";
}