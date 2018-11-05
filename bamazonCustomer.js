var mysql = require("mysql");
var inquirer = require("inquirer");

// create the connection information for the sql database
var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "Allah786",
  database: "bamazon_DB"
});

connection.connect(function(err){
    if (err) throw err;

    buyProduct();
});

function buyProduct() {
    // query the database for all items avaialble for purchase
    connection.query("SELECT * FROM products", function(err, results) {
      if (err) throw err;
      // once you have the items, how much would of the product would you like to buy
      inquirer
        .prompt([
          {
            name: "choice",
            type: "rawlist",
            choices: function() {
              var choiceArray = [];
              for (var i = 0; i < results.length; i++) {
                choiceArray.push(results[i].product_name +  ", $"+results[i].price + ", quantity:"+ results[i].stock_quantity);
              }
              return choiceArray;
            },
            message: "What product would you like to buy (enter ID number)?"
          },
          {
            name: "amount",
            type: "input",
            message: "How many would you like to buy?"
          }
        ])
        .then(function(answer) {
          // get the information of the chosen item
          var chosenItem = [];
          for (var i = 0; i < results.length; i++) {
            
            if (results[i].product_name === answer.choice.substr(0, answer.choice.indexOf(','))) {
              if (results[i].stock_quantity > parseInt(answer.amount)) {
                // bid was high enough, so update db, let the user know, and start over
                connection.query(
                  "UPDATE products SET ? WHERE ?",
                  [
                    {
                      stock_quantity: results[i].stock_quantity-answer.amount
                    },
                    {
                      id: results[i].id
                    }
                  ],

                  function(error) {
                    if (error) throw err;
                    console.log("Thanks for your purchase");
                    buyProduct();
                  }
                );
              }
              else {
                // bid wasn't high enough, so apologize and start over
                console.log("OUT OF STOCK");
                buyProduct();
              }
              //chosenItem =  new {stock :results[i].stock_quantity,
              //id:results[i].id}
            }
          }
          //console.log(chosenItem);
          // determine if bid was high enough
          
        });
    });
  }
  