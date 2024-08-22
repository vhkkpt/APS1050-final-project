var BookStore = artifacts.require("BookStore");
var BookComments = artifacts.require("BookComments");

module.exports = function(deployer) {
  deployer.deploy(BookStore);
  deployer.deploy(BookComments);
};
