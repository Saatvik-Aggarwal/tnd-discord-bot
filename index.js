// require the discord.js module
const Discord = require('discord.js');
const request = require('request');
const WebSocket = require('ws');

// create a new Discord client
const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'USER'], fetchAllMembers: true });

var mysql = require('mysql');


// when the client is ready, run this code
// this event will only trigger one time after logging in


// login to Discord with your app's token
client.login(process.env.DISCORD_BOT_TOKEN);

//create mysql pool
var pool = mysql.createPool({
    host: 'den1.mysql4.gear.host',
    user: 'tndbot',
    password: process.env.DATABASE_PASSWORD,
    database: "tndbot"
});

const mysticalID = 291048060845424640;

var betData = [{title: "Sample", description: "Sample Description", acceptingSubmissions: true, creator: "Mystical#8920", yesBetters: [{user: "Sample", amount:100}, {user: "Sample2", amount:1020}], noBetters: [{user: "Sample3", amount:100}, {user: "Sample4", amount:1820}] }];
var disabled = false;
/* 
[ 
    { 
        name: Saatvik,
        subject: Calculus,
        type: short,
        entryPoint: $100,
        quantity: 5
    },
    {
        name: Saatvik,
        subject: Calculus,
        type: long,
        entryPoint: $100,
        quantity: 5
    }
]
*/
var g = null;
var starChannel = null;
client.once('ready', () => {
    console.log('Ready!');
    client.user.setStatus("Booming");
    retrieveBets();
    console.log("Retrieved Bets!"); 
    client.guilds.fetch('412751760311058433').then(guild => {
        g = guild;
        starChannel = client.channels.cache.get('817485079407231009');
        request('https://finnhub.io/api/v1/quote?symbol=GME&token=' + process.env.FINNHUB_TOKEN, { json: true }, (err, res, body) => {
            if (err) { return console.log(err); }
    
            g.me.setNickname("GME: " + body.c);
    
        });
    });

    
});



client.on('message', msg => {
    if (msg.content.length < 3) return;
    if (msg.author.bot) {
        //console.log(msg.content);
        if (msg.content.indexOf("Revolution") > 0) {
            msg.reply("Aiming at <@510469810023563288>! Standing by and ready to fire on your mark!");
        }
        return;
    }
    if (msg.content.indexOf("bee") > 0 && msg.channel.id == 516795939768500254 && msg.author.id == 560314778753695744) { msg.delete(); msg.channel.send("Please refrain from using that word."); }
    if (msg.content.split('\n').length > 10 && msg.channel.id == 516795939768500254 && msg.author.id == 560314778753695744) { msg.delete(); msg.channel.send("Relax buddy..."); }
    if (msg.content.indexOf("@target") > -1 && msg.mentions.users.size > 0) { 
        setTimeout(() => {
            if (msg.reactions.cache.size > 0 && msg.mentions.users.array()[0].id == mysticalID || msg.mentions.users.array()[0].id == 530094038955720714) {
                msg.reply("Noted..."); 
                console.log(msg.author.tag);
                if (msg.author.id == 530094038955720714) {
                    setTimeout(() => { msg.channel.send("@target <@155149108183695360>"); }, 1025 * 60 * 20);
                } else {
                    setTimeout(() => { msg.channel.send("@target <@" + msg.author.id + ">"); }, 1025 * 60 * 20);
                }
                
            }
        }, 1000);
        
    }

    if (msg.content.indexOf("tim ") > -1) {
        msg.channel.send("<:squaresfavorite:795726008229429250>");
    }
    if (msg.channel.id == 516795939768500254) {
        if (msg.content.charAt(0) == '$') {
            msg.react('❌');
            return;
        }
        
    }
	if (msg.content[0] == "$") {
        // all commands should go in here.
        var args = msg.content.split(" ");

        args[0] = args[0].substring(1, args[0].length);
        //console.log(args[0] + " " + args[1]);

        command = args[0];
        args.shift();

        if (command == "toggle" && msg.author.id == mysticalID) disabled = !disabled;
        if (disabled && msg.author.id != mysticalID) {
            msg.reply("You are not authorized to interact with the bot right now");
            return;
        }

        if (command == "bet") {
            if (args.length < 1) {
                msg.reply("Please provide enough parameters");
            }
            if (args[0] == "list") {
                var reply = "Current Bets"
                betData.forEach(function(bet) {
                    if (bet.title != "Sample") {
                        reply += "\n__**" + bet.title + " - " + bet.description + ". Created by: " + bet.creator + "**__";
                        var totalYes = 0;
                        bet.yesBetters.forEach(function(individual) {
                            //reply += "<@" +individual.user + ">: " + individual.amount + "\n";
                            totalYes += individual.amount;
                        });
                        var totalNo = 0;
                        bet.noBetters.forEach(function(individual) {
                            //reply += "<@" + individual.user + ">: " + individual.amount + "\n";
                            totalNo += individual.amount;
                        });
                        const total = totalYes + totalNo;
                        reply += "\n--> ODDS: " + (100 * totalYes / total).toFixed(2) + "% Yes, Payout: " + (total/totalYes).toFixed(3) + "x | " + (100 * totalNo / total).toFixed(2) +  "% No, Payout: " + (total/totalNo).toFixed(3) + "x"; 
                    }
                    
                });
                msg.reply(reply);
                return;
            }
            if (args.length < 2) {
                msg.reply("Please provide enough parameters");
            }
            if (args[0] == "setup" && msg.author.id == mysticalID) {
                msg.reply("Access granted");
                if (args[1] == "table") {
                    runCommand(msg, "CREATE TABLE tnddata ( uid VARCHAR(255) NOT NULL, balance INT NOT NULL, positions TEXT )");
                } else if (args[1] == "users") {
                    var query = "INSERT INTO tnddata (uid, balance, positions) VALUES (" + msg.mentions.users.array()[0].id + ", 1000, '')";
                    runCommand(msg, query);  
                }  else if (args[1] == "killTable") {
                    runCommand(msg, "DROP TABLE tnddata");
                } else if (args[1] == "reset") {
                    runCommand(msg, "UPDATE tnddata SET balance = 1000");
                } else if (args[1] == "persistent") {
                    runCommand(msg, "CREATE TABLE betdata ( bets TEXT )", "p");
                } else if (args[1] == "godgive") {
                    changeMoneyOfUser(args[2], parseInt(args[3]));
                } else if (args[1] == "killper") {
                    runCommand(msg, "DROP TABLE betdata");
                }
            }

            if (args[0] == "create") {
                msg.react("☑️");
                //msg.reply("Creating bet");
                const things = msg.content.split("|");
                //$bet create | title | description
                if (things.length != 3) { msg.reply("Improper creation setup. $bet create | title | description"); return;}
                let bet = betData.find(b => b.title.trim() === things[1].trim());
                if (bet) {
                    msg.reply("A bet with this title already exists");
                    return;
                }
                betData.push({title: things[1], description: things[2], acceptingSubmissions: true, creator: msg.author.tag, yesBetters: [], noBetters: []});
                storeBets();
            } 

            if (args[0] == "info") {
                const things = msg.content.split("|");
                if (things.length != 2) { msg.reply("bad"); return; }

                var reply = "\n__Information for **" + things[1].trim() + "**__\n";
                
                let bet = betData.find(b => b.title.trim() === things[1].trim());

                if (bet) {
                    reply += "Creator: " + bet.creator + "\n";
                    reply += "Description: " + bet.description.trim() + "\n";
                    reply += "Is this bet accepting new submissions: " + bet.acceptingSubmissions;
                    reply += "\n**People betting YES:**\n";
                    var totalYes = 0;
                    bet.yesBetters.forEach(function(individual) {
                        reply += "<@" +individual.user + ">: " + individual.amount + "\n";
                        totalYes += individual.amount;
                    });
                    reply += "**Total: " + totalYes + "**\n";
                    reply += "**People betting NO:**\n";
                    var totalNo = 0;
                    bet.noBetters.forEach(function(individual) {
                        reply += "<@" + individual.user + ">: " + individual.amount + "\n";
                        totalNo += individual.amount;
                    });
                    reply += "**Total: " + totalNo + "**\n";
                    const total = totalYes + totalNo;
                    reply += "__**ODDS: " + (100 * totalYes / total).toFixed(2) + "% Yes, Payout: " + (total/totalYes).toFixed(3) + "x | " + (100 * totalNo / total).toFixed(2) +  "% No, Payout: " + (total/totalNo).toFixed(3) + "x**__"; 
                    storeBets();
                } else {
                    msg.reply("Bet not found!");
                    return;
                }
                msg.reply(reply);
            }
            if (args[0] == "closeWindow" || args[0] == "close") {
                const things = msg.content.split("|");
                if (things.length != 2) { msg.reply("bad"); return; }
                //$bet close | Sample
                
                let bet = betData.find(b => b.title.trim() === things[1].trim());
                if (bet) { 
                    bet.acceptingSubmissions = false;
                    msg.reply("No longer accepting submissions");
                    storeBets();
                }
                else {
                    msg.reply("Bet not found!");
                }
            }

            if (args[0] == "cancel" && msg.author.id == mysticalID) {
                const things = msg.content.split("|");
                let bet = betData.find(b => b.title.trim() === things[1].trim());
                bet.yesBetters.forEach(function(individual) {
                    changeMoneyOfUser(individual.user, individual.amount);
                });

                
                bet.noBetters.forEach(function(individual) {
                    changeMoneyOfUser(individual.user, individual.amount);
                });
            
                betData = betData.filter(data => data.title != bet.title);
                msg.reply("Done.");
                storeBets();
            }
            
            if (args[0] == "yes" || args[0] == "no") {
                const things = msg.content.split("|");
                if (things.length != 2 && msg.author.id != mysticalID) { msg.reply("bad"); return; }
                //$bet yes 1000 | Sample
                const amt = Math.round(parseInt(args[1]));
                
                
                let bet = betData.find(b => b.title.trim() === things[1].trim());
                if (bet) {
                    if (!bet.acceptingSubmissions && (!msg.content.includes("override") && msg.author.id != mysticalID)) {
                        msg.reply("This bet is no longer accepting submissions.");
                        return;
                    }
                    pool.getConnection(function (err, connection) { 
                        if (connection == undefined || connection == null) {
                            msg.reply("A connection could not be made to the server at this time");
                        } else { 
                            var u = msg.author.id;
                            if (msg.author.id == mysticalID && msg.mentions.users.size > 0) {
                                u = msg.mentions.users.first().id;
                                msg.reply("Access granted. Peforming bet on behalf of <@" + u + ">");
                            }
                            var result = connection.query("SELECT balance, positions FROM tnddata WHERE uid='" + u + "'", function (err, result, fields) {
                                if (err) { 
                                    msg.reply("Something went really wrong."); 
                                    console.log(err);
                                    return;
                                }
                                if ((result[0].balance < amt || amt < 10 || amt == undefined || isNaN(amt) || result[0].balance - amt < 10) && (!msg.content.includes("override") && msg.author.id != mysticalID)) {
                                    msg.reply("Improper amount!");
                                    return;
                                } else {
                                    //console.log(result[0].positions.length);
                                    if (result[0].positions.length > 20) {
                                        var currPositions = JSON.parse(result[0].positions)
                                        var totalAmountShort = 0;
                                        currPositions.forEach(function(pos) {
                                            if (pos.type == "short") {
                                                totalAmountShort += pos.quantity * pos.entryPoint;
                                            }
                                        });
                                        var unShortedBalance = result[0].balance - totalAmountShort;
                                        //console.log(unShortedBalance * 1.50);
                                        //console.log(result[0].balance - amt);
                                        if ((result[0].balance - amt) < totalAmountShort * 3) {
                                            msg.reply("You must mainatain collateral for your short positions. Amount shorted: " + totalAmountShort + " | Unshorted Balance: " + unShortedBalance + " | You must maintain a balance of at least " + (totalAmountShort) * 3 + ".");
                                            return;
                                        }
                                    }
                                    


                                    if (args[0] == "yes") {
                                        bet.yesBetters.push({user: u, amount: amt});
                                    } else if (args[0] == "no") {
                                        bet.noBetters.push({user: u, amount: amt});
                                    }

                                    if (u == msg.author.id) {
                                        changeMoneyOfUser(msg.author.id, -amt);
                                        msg.react("☑️");
                                        //msg.reply("Successfully bet");
                                    }
                                    
                                   
                                    storeBets();
                                }
                        });
                        connection.release();
                        }
                    });
                } else { msg.reply("Bet not found"); }
            }

            if (args[0] == "end" || args[0] == "finish" || args[0] == "complete") {
                const things = msg.content.split("|");
                if (things.length != 2) { msg.reply("bad"); return; }
                //$bet close | Sample
                let outcome = args[1];
                let bet = betData.find(b => b.title.trim() === things[1].trim());
                
                if (bet) { 
                    if (msg.author.tag != bet.creator && msg.author.id != mysticalID) {
                        msg.reply("You are not the owner of this bet!");
                        return;
                    }
                    var totalYes = 0;
                    var totalNo = 0;
                    var total = 0;

                    bet.yesBetters.forEach(function(individual) {
                        totalYes += individual.amount;
                        total += individual.amount;
                    });
                    bet.noBetters.forEach(function(individual) {
                        totalNo += individual.amount;
                        total += individual.amount;
                    });

                    if (outcome == "yes") {
                        var reply = ("Bet ended with yes. Winners: \n");

                        
                        bet.yesBetters.forEach(function(individual) {
                            changeMoneyOfUser(individual.user, Math.round(individual.amount * (total/totalYes)) );
                            reply += "<@" +individual.user + ">: " + individual.amount + "\n";
                        });

                        msg.reply(reply);
                    } else {
                        var reply = ("Bet ended with no. Winners: \n");
                        bet.noBetters.forEach(function(individual) {
                            changeMoneyOfUser(individual.user, Math.round(individual.amount * (total/totalNo)));
                            reply += "<@" +individual.user + ">: " + individual.amount + "\n";
                        });

                        msg.reply(reply);
                    }
                    betData = betData.filter(data => data.title != bet.title);
                    storeBets();
                }                
                else {
                    msg.reply("Bet not found!");
                }
            }
        } else if (command == "leaderboard" || command == "lb") {
            //var reply = "-+-Leaderboard-+-\n";

            var results = runCommand(msg, "SELECT uid, balance FROM tnddata ORDER BY balance DESC", "leaderboard");
            //msg.reply(results[0].uid);
            

            //msg.channel.send(reply);

        } else if (command == "stonks") {
            if (args[0] == "table") {
                if (msg.author.id == mysticalID) {
                    msg.reply("Creating table..");
                    runCommand(msg, "CREATE TABLE grades (uid TINYTEXT, subject TINYTEXT, grade FLOAT)");

                }
            } else if (args[0] == "setGrade") {
                if (args.length != 3) { msg.reply("do $stonks setGrade subject number"); return;}
                //$stonks setGrade subject number
                if (isNaN(parseInt(args[2]))) { 
                    msg.reply("Please provide a valid grade (no % symbols allowed). $stonks setGrade subject number");
                    return;
                }
                setGradeOfUser(msg, msg.author.id, args[1], args[2])
            } else if (args[0] == "long" || args[0] == "short") {
                //$stonks long @someone subject quantity

                if (args.length != 5) {
                    msg.reply("Format: $stonks long effect @person subject quantity. OR: $stonks close amount position#");
                    return;
                }
                if (msg.mentions.users.size < 1) { 
                    msg.reply("Tag whoever you want to long.");
                    return;
                }
                
                if (isNaN(args[4]) || parseInt(args[4]) < 1) {
                    msg.reply("Please provide a valid quantity.");
                }

                if (args[1] != "open" && args[1] != "close") {
                    msg.reply("Effect must be open or close. Format: $stonks long effect @person subject quantity. OR: $stonks close position order#");
                    return;
                }

                if (msg.author.id == msg.mentions.users.first().id) {
                    msg.reply("You cannot invest in yourself.");
                    return;
                }

                handlePosition(msg, msg.author.id, args[0], args[1], msg.mentions.users.first().id, args[3], Math.round(parseInt(args[4])), -1);
            } else if (args[0] == "positions") {
                if (msg.mentions.users.size > 0) {
                    showPositions(msg, msg.mentions.users.first().id);
                    return;
                }
                showPositions(msg, msg.author.id);
            } else if (args[0] == "list") {
                showGrades(msg);
            } else if (args.length == 3) {
                if (args[0] != "close" || isNaN(args[1]) || parseInt(args[1]) < 1 || isNaN(args[2]) || parseInt(args[2]) < 0) {
                    msg.reply("Format: $stonks long effect @person subject quantity. OR: $stonks close position order#");
                    return;
                }
                handlePosition(msg, msg.author.id, "" , "close", "id", "subject", parseInt(args[1]), parseInt(args[2]));
                
            }

            
        } else if (command == "balance" || command == "bal") {
            runCommand(msg, "SELECT balance FROM tnddata WHERE uid='" + msg.author.id + "'", "bal");
        } else if (command == "ask") {
            const url = "https://api.openai.com/v1/answers";
            // var xhr = new XMLHttpRequest();
            // xhr.open("POST", url, true);
            // xhr.setRequestHeader();
            // xhr.setRequestHeader();
            // xhr.onload = answerSuccess; 
            // var question = msg.content.split(command);
            // xhr.send());

            
              

            fetch(url, {
                method: "POST",
                body: JSON.stringify({
                    "model": "davinci",
                    "question": question,
                    "examples": [["Who is a retard?", "Sam"], ["Who likes los drogos?", "Pratham Saxena"], ["What is the meaning of life?", "Frik you!"]],
                    "examples_context": "Sam is a retard. Pratham Saxena does drugs.",
                    "temperature": "0.8"
                }),
                headers: {"Content-Type": "application/json", "Authorization": "Bearer " + process.env.AI_TOKEN }

            })
            .then( res => res.json() )
            .then( data => msg.reply(data.answers[0]));
        } else {
            msg.reply("Unknown command");
        }

        

        
    }
});

function answerSuccess() {
    msg.reply(JSON.parse(this.reponse))
}
function runCommand(msg, cmd, responseAfter) { 
    pool.getConnection(function (err, connection) { 
        if (connection == undefined || connection == null) {
            msg.reply("A connection could not be made to the server at this time");
        } else {

            var result = connection.query(cmd, function (err, result, fields) {
                if (err) { 
                    msg.reply("Something went really wrong."); 
                    console.log(err);
                    return;
                }
                if (responseAfter == "leaderboard") {
                    var reply = "\n-+-Leaderboard-+-\n";
                    for (var counter = 0; counter < result.length; counter++) {
                        var x = result[counter].balance;
                        reply += "<@" + result[counter].uid + ">: " + x + "\n";
                    }
                    msg.reply(reply);
                }
                if (responseAfter == "p") {
                    var resultT = connection.query("INSERT INTO betdata (bets) VALUES ('" + JSON.stringify(betData) + "')", function (err, result, fields) {
                        if (err) { 
                            msg.reply("Something went really wrong."); 
                            console.log(err);
                            return; 
                        }
                        msg.reply("Inserted successfully.");
                    });
                }
                if (responseAfter == "bal") {
                    msg.reply("You have $" + result[0].balance);
                }
                //return result;
            });
            connection.release();

        }
    });

    
}

function changeMoneyOfUser(userID, amount) {
    pool.getConnection(function (err, connection) { 
        if (connection == undefined || connection == null) {
            console.log("A connection could not be made to the server at this time");
        } else {

            var result = connection.query("SELECT balance FROM tnddata WHERE uid='" + userID + "'", function (err, result, fields) {
                if (err) { 
                    console.log("Something went really wrong."); 
                    console.log(err);
                    return;
                }
                if (result.length < 1) {
                    return;
                }
                var bal = result[0].balance;
                var resultT = connection.query("UPDATE tnddata SET balance=" + (bal + amount) + " WHERE uid='" + userID+ "'", function (err, result, fields) {
                    if (err) { 
                        console.log("Something went really wrong."); 
                        console.log(err);
                        return;
                    }
                    
                });

                //worked

            });
            connection.release();

        }
    });
}

function setGradeOfUser(msg, userID, subject, newGrade) {
    pool.getConnection(function (err, connection) { 
        if (connection == undefined || connection == null) {
            console.log("A connection could not be made to the server at this time");
        } else {

            var result = connection.query("SELECT grade FROM grades WHERE uid='" + userID + "' AND subject='" + subject + "'", function (err, result, fields) {
                if (err) { 
                    console.log("Something went really wrong."); 
                    console.log(err);
                    return;
                }
                if (result.length < 1) {
                    var resultT = connection.query("INSERT INTO grades (uid, subject, grade) VALUES ('" + userID + "', '" + subject + "', " + newGrade + ")", function (err, result, fields) {
                        if (err) { 
                            console.log("Something went really wrong."); 
                            console.log(err);
                            return;
                        }
                        msg.reply("Successfully created and updated the entry.");
                        //connection.release();
                        return;
                    });
                    
                } else {
                    var resultT = connection.query("UPDATE grades SET grade=" + newGrade + " WHERE uid='" + userID+ "' AND subject='" + subject + "'", function (err, result, fields) {
                        if (err) { 
                            console.log("Something went really wrong."); 
                            console.log(err);
                            return;
                        }
                        msg.reply("Successsfully updated the grade.");
                    });
                }
                

                //worked

            });
            connection.release();

        }
    });  
}

function showGrades(msg) {
    pool.getConnection(function (err, connection) { 
        if (connection == undefined || connection == null) {
            console.log("A connection could not be made to the server at this time");
        } else {

            var result = connection.query("SELECT uid, subject, grade FROM grades ORDER BY uid, grade DESC", function (err, result, fields) {
                if (err) { 
                    console.log("Something went really wrong."); 
                    console.log(err);
                    return;
                }
                var reply = "List of grades: \n";

                result.forEach(function(row) {
                    if (row.grade < 150) {
                        reply += "<@" + row.uid + ">'s " + row.subject + " grade: " + row.grade + "\n";
                    }
                    
                });

                msg.reply(reply);

            });
            connection.release();

        }
    });  
}

/* 
tnddata | positions
[ 
    { 
        name: Saatvik,
        subject: Calculus,
        type: short,
        entryPoint: $100,
        quantity: 5
    },
    {
        name: Saatvik,
        subject: Calculus,
        type: long,
        entryPoint: $100,
        quantity: 5
    }
]
*/

function handlePosition(msg, userID, typeP, effectP, nameP, subjectP, quantityP, orderNumber) {

    pool.getConnection(function (err, connection) { 
        if (connection == undefined || connection == null) {
            msg.reply("A connection could not be made to the server at this time");
        } else { 
            var result = connection.query("SELECT balance, positions FROM tnddata WHERE uid='" + msg.author.id + "'", function (err, result, fields) {
                if (err) { 
                    msg.reply("Something went really wrong."); 
                    console.log(err);
                    connection.release();
                    return;
                }
                if (quantityP == undefined || isNaN(quantityP) || (quantityP < 0 && typeP == "close")) {
                    msg.reply("Improper amount!");
                    return;
                } 
                var newBal = result[0].balance;
                var currPositions  = JSON.parse(result[0].positions);
                if (orderNumber > -1 && orderNumber < currPositions.length) {
                    nameP = currPositions[orderNumber].name;
                    subjectP = currPositions[orderNumber].subject;
                    typeP = currPositions[orderNumber].type;
                }
                
                var resultT = connection.query("SELECT grade FROM grades WHERE uid='" + nameP + "' AND subject='" + subjectP + "'", function (err, resulta, fields) {
                    if (err) { 
                        console.log("Something went really wrong."); 
                        console.log(err);
                        connection.release();
                        return;
                    }
                    if (resulta.length < 1) {
                        msg.reply("This thing does not exist");
                        //connection.release();
                        return;
                    }

                                            
                    
                    
                    
                    if (effectP == "open") {
                        if (result[0].positions.length > 20) {
                            currPositions = JSON.parse(result[0].positions);
                            currPositions.push({ name: nameP, subject: subjectP, type: typeP, entryPoint: resulta[0].grade, quantity: quantityP });
                        } else {
                            currPositions = [ { name: nameP, subject: subjectP, type: typeP, entryPoint: resulta[0].grade, quantity: quantityP } ];
                        }
                    } else if (effectP == "close") {
                        if (result[0].positions.length > 15) {
                            currPositions = JSON.parse(result[0].positions);
                            var pos = currPositions.find(obj => obj.name == nameP && obj.subject == subjectP && obj.type == typeP);
                            if (orderNumber > -1 && orderNumber < currPositions.length) {
                                pos = currPositions[orderNumber];
                                //console.log(quantityP);
                            }
                            if (pos == null || pos == undefined) {
                                msg.reply("This position does not exist");
                                //connection.release();
                                return;
                            } else {
                                if (quantityP > pos.quantity) {
                                    msg.reply("Invalid amount!");
                                    //connection.release();
                                    return;
                                } else {
                                    pos.quantity = pos.quantity - quantityP;
                                    if (typeP == "short") {
                                        newBal -= pos.entryPoint * quantityP;
                                        newBal += Math.round((pos.entryPoint - resulta[0].grade) * quantityP * 10);
                                    } else if (typeP == "long") {
                                        //console.log("Old " + newBal);
                                        newBal += pos.entryPoint * quantityP;
                                        newBal += Math.round((resulta[0].grade - pos.entryPoint) * quantityP * 10);
                                        //console.log("New: " + newBal);
                                    }
                                    currPositions = currPositions.filter(data => data.quantity != 0);

                                }
                            }
                        } else {
                            msg.reply("You don't have any positions");
                            //connection.release();
                            return;
                        }
                    }
                    
                    var totalAmountShort = 0;
                    currPositions.forEach(function(pos) {
                        if (pos.type == "short") {
                            totalAmountShort += pos.quantity * pos.entryPoint;
                        }
                    });
                    if (typeP == "short" && effectP == "open") {
                        newBal += resulta[0].grade * quantityP;
                        var unShortedBalance = newBal - totalAmountShort;
                        console.log(totalAmountShort);
                        console.log(newBal);
                        if (newBal > unShortedBalance * 1.5) {
                            msg.reply("You cannot be short over 50% of your unshorted balance ($" + unShortedBalance + ")!");
                            return;
                        }
                    } else if (typeP == "long" && effectP == "open") {
                        newBal -= resulta[0].grade * quantityP;
                        var unShortedBalance = newBal - totalAmountShort;
                        console.log(totalAmountShort);
                        console.log(newBal);
                        if (newBal < totalAmountShort * 3) {
                            msg.reply("You cannot be short over 50% of your unshorted balance. You must maintain a balance of at least ($" + totalAmountShort*3 + ")!");
                            return;
                        }
                    } 

                    if (newBal < 0) {
                        msg.reply("Not enough money.");
                        //connection.release();
                        return;
                    }


                    var q = "UPDATE tnddata SET positions='" + JSON.stringify(currPositions) + "', balance=" + newBal +" WHERE uid='" + userID + "'";
                    var resultThree = connection.query(q, function (err, result, fields) {
                        if (err) { 
                            console.log("Something went really wrong."); 
                            console.log(err);
                            //connection.release();
                            return;
                        }
                        msg.react("☑️");
                        //msg.reply("The transaction was succesfully performed.");
                    });
                    
                });

                
        });
        connection.release();
        }
    }); 
    
}

function showPositions(msg, userID) {
    pool.getConnection(function (err, connection) { 
        if (connection == undefined || connection == null) {
            console.log("A connection could not be made to the server at this time");
        } else {

            var result = connection.query("SELECT positions FROM tnddata WHERE uid='" + userID + "'", function (err, result, fields) {
                if (err) { 
                    console.log("Something went really wrong."); 
                    console.log(err);
                    return;
                }
                var reply = "List of positions for <@" + userID + ">\n";
                if (result[0].positions.length > 15) {
                    const positionList = JSON.parse(result[0].positions);
                    var x = 0;
                    positionList.forEach(function(pos) {
                        
                        reply += "Position #" + x + ": " + pos.type + " x" + pos.quantity + " <@" + pos.name + ">'s " + pos.subject + " grade @" + pos.entryPoint + "%\n";
                        x++;
                    });
                } else {
                    reply += "None";
                }
                msg.reply(reply);
                //worked

            });
            connection.release();

        }
    });
}



function storeBets() {
    var x = JSON.stringify(betData);
    pool.getConnection(function (err, connection) { 
        if (connection == undefined || connection == null) {
            //msg.reply("A connection could not be made to the server at this time");
        } else {
            var result = connection.query("UPDATE betdata SET bets='" + x + "'", function (err, result, fields) {
                if (err) { 
                    //msg.reply("Something went really wrong."); 
                    console.log(err);
                    return;
                }
                
            });
            connection.release();

        }
    });
}

function retrieveBets() {
    pool.getConnection(function (err, connection) { 
        if (connection == undefined || connection == null) {
            //msg.reply("A connection could not be made to the server at this time");
            console.log("BAD STUFF");
        } else {
            var result = connection.query("SELECT bets FROM betdata", function (err, result, fields) {
                if (err) { 
                    //msg.reply("Something went really wrong."); 
                    console.log(err);
                    return;
                }
                if (JSON.parse(result[0].bets).length < 2) return;

                betData = JSON.parse(result[0].bets);
                
            });
            connection.release();

        }
    });
}

function updateNickToPrice(d) {
    if (d.type == "trade") {
        g.me.setNickname(d.data[0].v + " @ " + d.data[0].p);
    } else {
        //console.log("Received a " + d.type);
    }
    
}

const socket = new WebSocket('wss://ws.finnhub.io?token=' + process.env.FINNHUB_TOKEN);

// Connection opened -> Subscribe
socket.addEventListener('open', function (event) {
    socket.send(JSON.stringify({'type':'subscribe', 'symbol': 'GME'}))

});

// Listen for messages
socket.addEventListener('message', function (event) {

    updateNickToPrice(JSON.parse(event.data));
});

var starredMessages = [];
var sentStarredMessages = [];

client.on('messageReactionAdd', async (reaction, user) => {
    if (reaction.emoji.id == "795726008229429250") {
        console.log("tim added");
    }
    if (reaction.emoji.id == "795726008229429250" && reaction.count >= 7) {

        
        starChannel = client.channels.cache.get('817505997194526790');
        if (reaction.message.partial) await reaction.message.fetch();
        if (reaction.partial) await reaction.fetch();
        const exampleEmbed = new Discord.MessageEmbed()
        .setColor('#0000ff')
        .setAuthor(reaction.message.author.tag, reaction.message.author.avatarURL())
        .setDescription(reaction.message.content)
        .setTimestamp()
        .setFooter(reaction.count + " tims | " + reaction.message.url);

        if (reaction.message.attachments.entries.length > 0) {
            exampleEmbed.setImage(reaction.message.attachments.first().proxyURL);
        }

        if (starredMessages.indexOf(reaction.message.id) > -1) {
            sentStarredMessages[starredMessages.indexOf(reaction.message.id)].edit(exampleEmbed);

        } else {
            sentStarredMessages.push(await starChannel.send(exampleEmbed));
            starredMessages.push(reaction.message.id);
        }
        

        
        
        
    }
});

client.on('messageReactionRemove', async(reaction, user) => {
    if (reaction.emoji.id == "795726008229429250") {
        starChannel = client.channels.cache.get('817505997194526790');
        if (reaction.message.partial) await reaction.message.fetch();
        if (reaction.partial) await reaction.fetch();
        const exampleEmbed = new Discord.MessageEmbed()
        .setColor('#0000ff')
        .setAuthor(reaction.message.author.tag, reaction.message.author.avatarURL())
        .setDescription(reaction.message.content)
        .setTimestamp()
        .setFooter(reaction.count + " tims | " + reaction.message.url);

        if (reaction.message.attachments.entries.length > 0) {
            exampleEmbed.setImage(reaction.message.attachments.first().proxyURL);
        }
        
        if (starredMessages.indexOf(reaction.message.id) > -1 && reaction.count < 7) {

            sentStarredMessages[starredMessages.indexOf(reaction.message.id)].delete();
            sentStarredMessages.splice(starredMessages.indexOf(reaction.message.id), 1);
            starredMessages.splice(starredMessages.indexOf(reaction.message.id));

        } else if (starredMessages.indexOf(reaction.message.id) > -1) {
            sentStarredMessages[starredMessages.indexOf(reaction.message.id)].edit(exampleEmbed);
        }
        
    }
        

});