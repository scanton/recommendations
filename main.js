const fs = require('fs-extra');
const brain = require('brain.js');

//import sales history

var salesHistory = require(__dirname + '/sales_history.json');

//find total number of unique items in the data

var items = {};
var l = salesHistory.length;
while(l--) {
	let cart = salesHistory[l];
	var l2 = cart.length;
	while(l2--) {
		items[cart[l2]] = true;
	}
}
var itemCount = 0;
for(var property in items) {
	++itemCount;
}

console.log(itemCount + " unique items found in sales history");

//convert sales history to create training set

var convertToBinaryArray = function(cart, totalItems) {
	let a = new Array(totalItems);
	a.fill(0, 0);
	let l = cart.length;
	while(l--) {
		a[cart[l]] = 1;
	}
	return a;
}

var trainingSet = [];
var l = salesHistory.length;
while(l--) {
	let cart = salesHistory[l];
	let l2 = cart.length;
	while(l2--) {
		let c = cart.slice();
		let input = c.splice(l2, 1);
		trainingSet.push({input: convertToBinaryArray([input], itemCount), output: convertToBinaryArray(c, itemCount)})
	}
}

//console.log(trainingSet);
console.log("Created training set");

//instiantiate brain.js and train network

var config = {
	binaryThresh: 0.33,
	hiddenLayers: [15, 10],
	activation: 'sigmoid'
}
var net = new brain.NeuralNetwork(config);

console.log("Beginning training");
net.train(trainingSet, {log: true, iterations: 2000});
console.log("training complete");

//save trained network to external file

var saveData = net.toJSON();
fs.outputJsonSync(__dirname + '/network_data.json', saveData, { spaces: '\t' });

//test output

var testCart = [2, 4];

var recommendations = net.run(convertToBinaryArray(testCart, itemCount));

//correct for existing items in the cart
var l = testCart.length;
while(l--) {
	recommendations[testCart[l]] = 0;
}

console.log("recommendations", recommendations);