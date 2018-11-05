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

    //start();
    start();
});

function start(){

    inquirer
    .prompt([
        {
            name: "choice",
            type: "rawlist",
            choices: function(){
                var functionArray = ["View Products", "View Low Product",
                 "Add Inventory", "Add New Product"];
                 return functionArray;
            },
            message: "What would you like to do (enter ID number)?"
        }
    ])
    .then(function(answer){
        console.log(answer.choice);

       if (answer.choice === "View Products"){
           viewProducts();
       }
       if (answer.choice === "View Low Product"){
           viewLowProduct();
       }
       if (answer.choice === "Add Inventory"){
           addInventory();
       }
       if (answer.choice === "Add New Product"){
           addNewProduct();
       }
    })


}

//      View Products for Sale

function viewProducts(){

    connection.query("SELECT * FROM products", function(err, results){
if (err) throw err;

//for (var i = 0; i < results.length; i++) 

    

console.log(results);    
start();
})
}
//      View Low Inventory

function viewLowProduct(){
    connection.query("SELECT * FROM products WHERE stock_quantity <= 5", function(err, results){
        if (err) throw err;
        
        //for (var i = 0; i < results.length; i++)
        console.log(results);    
        
        start();
        })

}
    
//      Add to Inventory

function addInventory(){
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
              message: "What product would you like to add to (enter ID number)?"
            },
            {
              name: "amount",
              type: "input",
              message: "What amount would you like to add?"
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
                        stock_quantity: results[i].stock_quantity + parseInt(answer.amount)
                      },
                      {
                        id: results[i].id
                      }
                    ],
  
                    function(error) {
                      if (error) throw err;
                      console.log("Added succesfully.");
                      start();
                    }
                  );
                }
                else {
                  // bid wasn't high enough, so apologize and start over
                 // console.log("OUT OF STOCK");
                  start();
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
 

    
//      Add New Product

function addNewProduct(){
    inquirer
    .prompt([
      {
        name: "item",
        type: "input",
        message: "What product would you like to add?"
      },
      {
        name: "category",
        type: "input",
        message: "What category would you like to place your product in?"
      },
      {
        name: "price",
        type: "input",
        message: "What is the price of the item?"
      },
      {
        name: "quantity",
        type: "input",
        message: "How many?",
        validate: function(value) {
          if (isNaN(value) === false) {
            return true;
          }
          return false;
        }
      }
    ])
    .then(function(answer) {
      // when finished prompting, insert a new item into the db with that info
      connection.query(
        "INSERT INTO products SET ?",
        {
          product_name: answer.item,
          department: answer.category,
          price: answer.price,
          stock_quantity: answer.quantity
        },
        function(err) {
          if (err) throw err;
          console.log("Your product was added successfully!");
          // re-prompt the user for if they want to bid or post
          start();
        }
      );
    });
}

