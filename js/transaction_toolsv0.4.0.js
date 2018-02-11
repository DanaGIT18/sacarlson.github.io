"use strict";
   
    // Initialize everything when the window finishes loading
    window.addEventListener("load", function(event) {
      StellarSdk.Network.useTestNetwork();

      var network_testnet = document.getElementById("network_testnet");
      var message = document.getElementById("message");
      var account = document.getElementById("account");
      var inflation_dest = document.getElementById("inflation_dest");
      var destination = document.getElementById("destination");
      var dest_seed = document.getElementById("dest_seed");
      var issuer = document.getElementById("issuer");
      var asset = document.getElementById("asset");
      var seed = document.getElementById("seed");
      var tissuer = document.getElementById("tissuer");
      var tasset = document.getElementById("tasset");
      var amount = document.getElementById("amount");
      var balance = document.getElementById("balance");
      var CHP_balance = document.getElementById("CHP_balance");
      var asset_type = document.getElementById("asset_type");
      var memo = document.getElementById("memo");
      var memo_mode = document.getElementById("memo_mode");
      var dest_balance = document.getElementById("dest_balance");
      var dest_CHP_balance = document.getElementById("dest_CHP_balance");      
      var url = document.getElementById("url");
      var port = document.getElementById("port");
      var secure = document.getElementById("secure");
      var open = document.getElementById("open");
      var close = document.getElementById("close");
      var merge_accounts = document.getElementById("merge_accounts");
      var status = document.getElementById("status");
      var network = document.getElementById("network");
      var envelope_b64 = document.getElementById("envelope_b64");      
      var asset_obj = new StellarSdk.Asset.native();
      var socket;
      var socket_open_flag = false;
      var operation_globle;
      var paymentsEventSource;
      var server;
      var key;
      var email_flag = false;
      var transaction;
      var server_mode = "horizon";
      var fed_mode_forward = true;
      var account_obj_global;
      var destination_home_domain;
    //var server_mode = "mss_server";
      
      seed.value = restore_seed("seed1", "");
      //seed.value = 'SA3CKS64WFRWU7FX2AV6J6TR4D7IRWT7BLADYFWOSJGQ4E5NX7RLDAEQ';
      //seed.value = 'SAPUDAQ72EA5SWTFAJG7Z4KQ62PUXN7SBUC4EOYNEZITVFSTHOIHGGCA'; 
      console.log("seed.value: " + seed.value);     
      console.log("seed.value.length: " + seed.value.length);
            
      //key = StellarSdk.Keypair.fromSeed(seed.value);
      if (seed.value.length != 56) {
        key = StellarSdk.Keypair.random();
        console.log("key ok");
        account.value = key.accountId();
        console.log("account ok");
        seed.value = key.seed();
        console.log("seed ok");
        save_seed("seed1", "", seed.value );
      } else {
         account.value = StellarSdk.Keypair.fromSeed(seed.value).accountId();
      }
      //seed.value = 'SA3CKS64WFRWU7FX2AV6J6TR4D7IRWT7BLADYFWOSJGQ4E5NX7RLDAEQ'; 
      //account.value = 'GAMCHGO4ECUREZPKVUCQZ3NRBZMK6ESEQVHPRZ36JLUZNEH56TMKQXEB'
   

      var env_b64 = window.location.href.match(/\?env_b64=(.*)/);
      var encrypted_seed = window.location.href.match(/\?seed=(.*)/);
      var accountID = window.location.href.match(/\?accountID=(.*)/);
      var json_param = window.location.href.match(/\?json=(.*)/);
      if (env_b64 !== null) {
        console.log(env_b64[1]);
      }
      if (json_param != null) {
        //escape(str)
        console.log("json_param detected");
        json_param = unescape(json_param[1]);
        var params = JSON.parse(json_param);
        console.log(params);
        console.log(params["accountID"]);
        console.log(params["env_b64"]);
        if (typeof params["accountID"] != "undefined") {
          account.value = params["accountID"];
        }
        if (typeof params["env_b64"] != "undefined") {
          console.log("env_b64 param detected");
          envelope_b64.value = params["env_b64"];
          account.value = new StellarSdk.Transaction(envelope_b64.value).operations[0].destination;
          console.log(new StellarSdk.Transaction(envelope_b64.value).operations[0].asset);
          tissuer.value = new StellarSdk.Transaction(envelope_b64.value).operations[0].asset.issuer;
          tasset.value = new StellarSdk.Transaction(envelope_b64.value).operations[0].asset.code;
          asset_type.value = tasset.value;
        }               
        if (typeof params["seed"] != "undefined") {
          seed.value = params["seed"];
        }
        if (typeof params["amount"] != "undefined") {
          amount.value = params["amount"];
        }
        if (typeof params["memo"] != "undefined") {
          memo.value = params["memo"];
        }
        if (typeof params["asset"] != "undefined") {
          asset.value = params["asset"];
        }
        if (typeof params["issuer"] != "undefined") {
          issuer.value = params["issuer"];
        }
        if (typeof params["destination"] != "undefined") {
          destination.value = params["destination"];
        }
      } 
      if (encrypted_seed != null) {
        console.log(encrypted_seed[1]);
        seed.value = encrypted_seed[1];
        update_key();      
      }    
      if (accountID != null) {
        console.log("here?");
        console.log(accountID[1]);
        account.value = accountID[1];
      }

      //merge_accounts.disabled = true;
      network.value ="testnet";
      console.log("just after var");
      status.textContent = "Not Connected";
      url.value = "horizon-testnet.stellar.org";
      port.value = "443";
      secure.value = "true";
      //create_socket();
      close.disabled = true;
      open.disabled = true;
      sign_tx.disabled = true;
      
      if (typeof memo.value == "undefined") {
        memo.value = "scotty_is_cool";
      }
      if (typeof amount.value == "undefined"){
        amount.value = "1"; 
      }
      console.log("asset_type: " + (typeof asset_type.value));
      console.log("asset_type.length: " + asset_type.value.length);
      if (typeof asset_type.value == "undefined" || asset_type.value.length == 0) {     
        asset_type.value = "AAA";
        tissuer.value = 'GAX4CUJEOUA27MDHTLSQCFRGQPEXCC6GMO2P2TZCG7IEBZIEGPOD6HKF';
        issuer.value = tissuer.value;
        tasset.value = 'AAA';
      }
      
      if (typeof destination.value == "undefined"){
        dest_seed.value = restore_seed("seed2", "");
        console.log("dest_seed.value: " + dest_seed.value);
        if (dest_seed.value.length != 0) {
          destination.value = StellarSdk.Keypair.fromSeed(dest_seed.value).accountId();
          console.log("dest: " + destination.value); 
        }
      }   
      //destination.value = 'GDVYGXTUJUNVSJGNEX75KUDTANHW35VQZEZDDIFTIQT6DNPHSX3I56RY';
      //dest_seed.value = "SBV5OHE3LGOHC6CBRMSV3ZQNTT4CM7I7L37KAAU357YDDPER2GNP2WWL";      

      //StellarSdk.Network.useTestNet();
      //StellarSdk.Memo.text("sacarlson");
      //var hostname = "horizon-testnet.stellar.org";
            
      reset_horizon_server();

      current_mode.value = "Stellar horizon TestNet";
      
      if (account.value.length > 0) {
        console.log("account value: " + account.value);
        console.log(typeof account.value);
      } else {  
        key = StellarSdk.Keypair.fromSeed(seed.value);
        update_key();
      }      
    
      update_balances();
      start_effects_stream();
      
      var xmlhttp = new XMLHttpRequest();

    
      xmlhttp.onreadystatechange = function() {
              console.log("onreadystatechange");
              console.log("readystate: " + xmlhttp.readyState + " xmlhttp.status: " + xmlhttp.status);
              if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                console.log("responseText: " + xmlhttp.responseText);
                var myArr = JSON.parse(xmlhttp.responseText);
                console.log("xmlhttp response");                
                console.log(myArr);
                console.log(myArr.account_id);
                if (fed_mode_forward) {
                  destination.value = myArr.account_id;
                } else {
                  destination.value = myArr.stellar_address;
                }
              }
      };

          function email_funds_now (mode) {
            if (mode != "email_tx"){
             var mail = "mailto:" + email_address.value +"?subject= Stellar funds transmittal for: " + amount.value + " of asset: "+ asset.value + "&body=Click on the link bellow to collect the funds I have sent you for the amount of " + amount.value + " of asset type: "+ asset.value + " to the accountID " + destination.value + " secret seed if contained: " + dest_seed.value  + "  just click Link: https://sacarlson.github.io/transaction_toolsv0.4.0.html?json={%22env_b64%22:%22" + envelope_b64.value + "%22}   " +  ". From within the wallet just hit send_tx button to transact the issued transaction and verify balance received.   Or if you prefer other methods of receiving the transaction the Stellar envelope base64: " + envelope_b64.value;
        } else {
          var mail = "mailto:" + email_address.value +"?subject= Stellar TX transaction to be signed &body=Click on the link bellow to go to signing tool just click Link: http://sacarlson.github.io//transaction_toolsv0.4.0.html?json={%22env_b64%22:%22" + envelope_b64.value + "%22}   . From within the wallet just hit sign_tx to sign and send_tx button to transact the issued transaction after fully signed.   Or if you prefer other methods of signing tx the Stellar envelope base64: " + envelope_b64.value;
        }
        console.log("mail content: ");
        console.log(encodeURI(mail));
        message.textContent = encodeURI(mail);
        window.open(encodeURI(mail));
          }

          function federation_lookup(){
            // need to add stellar.toml lookup at some point or just move to stellar sdk implementation of lookup
            fed_mode_forward = true;
            console.log("federation_lookup click detected");
            //https://equid.co/federation?q=sacarlson*equid.co&type=name'
            //var url = "https://equid.co/federation?q=" + destination.value + "*equid.co&type=name";
            var url = "https://api.";
            // sacarlson*equid.co
            var index_at = destination.value.indexOf("@");
            var index_ast = destination.value.indexOf("*");
            console.log("index_at: " + index_at);
            console.log("index_ast: " + index_ast);
            if (index_at == -1 && index_ast == -1){
              destination.value = destination.value + "*equid.co";
            }
            if (index_at >= 0 && index_ast >= 0){
              console.log("have both * and @ in lookup, so don't change");
            } else{
              console.log("only have * or @ in lookup, will change any @ to *");
              destination.value = destination.value.replace("@", "*");
            }
            var start_index = destination.value.indexOf("*");
            url = url + destination.value.substring(start_index+1);
            console.log("url: " + url);
            url = url + "/federation?q=" + destination.value + "&type=name";
            console.log("url+: " + url);
            xmlhttp.open("GET", url, true);
            xmlhttp.send();            
          }

          function reverse_federation_lookup(){
            // this also need stellar.toml file lookup at some point or trash for stellar sdk version when working
            fed_mode_forward = false;
            console.log("reverse_federation_lookup click detected");
            //console.log(account_obj_global);
            if (typeof destination_home_domain == "undefined") {
              console.log("no home_domain");
            } else {
              var url = "https://api." + destination_home_domain + "/federation?q=" + destination.value +"&type=id";
              console.log("url: " + url);
              xmlhttp.open("GET", url, true);
              xmlhttp.send();
            }            
          }

         
          
          function attachToPaymentsStream(opt_startFrom) {
            console.log("start attacheToPaymentsStream");
            var futurePayments = server.effects().forAccount(account.value);
            if (opt_startFrom) {
                console.log("opt_startFrom detected");
                futurePayments = futurePayments.cursor(opt_startFrom);
            }
            if (paymentsEventSource) {
                console.log('close open effects stream');
                paymentsEventSource.close();
            }
            console.log('open effects stream with cursor: ' + opt_startFrom);
            paymentsEventSource = futurePayments.stream({
                onmessage: function (effect) { effectHandler(effect, true); }
            });
          };

          function start_effects_stream() {
	    server.effects()
            .forAccount(account.value)
            .limit(30)
            .order('desc')
            .call()
            .then(function (effectResults) {
                console.log("then effectResults");
                var length = effectResults.records ? effectResults.records.length : 0;
                for (index = length-1; index >= 0; index--) {
                    console.log("index" + index);
                    var currentEffect = effectResults.records[index];
                    effectHandler(currentEffect, false);
                }
                var startListeningFrom;
                if (length > 0) {
                    latestPayment = effectResults.records[0];
                    startListeningFrom = latestPayment.paging_token;
                }
                attachToPaymentsStream(startListeningFrom);
            })
            .catch(function (err) {
                //console.log(err);
                console.log("error detected in attachToPaymentsStream");
                attachToPaymentsStream('now');               
            });
          }

          function effectHandler(effect,tf) {
            console.log("got effectHandler event");
            console.log(tf);
            console.log(effect);
            if (effect.type === 'account_debited') {
               if (effect.asset_type === "native") {
                  balance.value = balance.value - effect.amount;
               }else {
                  CHP_balance.value = CHP_balance.value - effect.amount;
               }
            }
            if (effect.type === 'account_credited') {
               if (effect.asset_type === "native") {
                  balance.value = balance.value + effect.amount;
               }else {
                  CHP_balance.value = CHP_balance.value + effect.amount;
               }
            }
            if (effect.type === 'account_created') {
               balance.value = effect.starting_balance;
            }
          };

      function reset_horizon_server() {
        console.log("reset_horizon_server"); 
        console.log("secure: " + secure.value);
        var tf = true;
        if (secure.value == "false") { 
          tf = false;
        }  
        server = new StellarSdk.Server({     
          hostname: url.value,
          port: Number(port.value),
          secure: tf
        });
      }
       
      function get_account_info(account,params,callback) {
        if (server_mode === "mss_server") {
          socket_open_flag = true;
        }else {
          console.log("get_account_info horizon mode");
          server.accounts()
          .accountId(account)
          .call()
          .then(function (accountResult) {
            callback(accountResult,params);                    
          })
          .catch(function (err) {
            console.log("got error in get_account_info");
            console.error(err);
            callback(err,params);          
          })
        }
      }

      function display_message(param) {
        message.textContent = JSON.stringify(param);
      }

       function update_balances_set(account_obj,params) {
        console.log("params: " + params.asset_code1 + " 2" + params.asset_code2);
        //console.log("account_obj");
        //console.log(account_obj);
        account_obj_global = account_obj;     
        display_balance(account_obj,{to_id:params.to_id1,
          asset_code:params.asset_code1,
          detail:false}
        );   
        if (params.asset_code2 == "XLM" || params.asset_code2 == "native"){
          console.log("was XLM");
          //account_obj.balances.xlm = balance.value;
          //params.asset_code2 = "native";
        } else {
          display_balance(account_obj,{
            to_id:params.to_id2,
            asset_code:params.asset_code2,
            detail:params.detail}
          );
        }
      }

      function display_balance(account_obj,params) { 
          console.log("account_obj2");
          console.log(account_obj); 
          console.log("asset_code: " + params.asset_code);
          console.log(account_obj.account_id);
          if (account_obj.account_id == destination.value){
            console.log("distination_home_domain: " + destination_home_domain);
            destination_home_domain = account_obj.home_domain;
          }        
          var balance = 0;
          console.log("display_balance account_obj");
          console.log(account_obj);
          console.log(account_obj.name);
          if (account_obj.name !== "NotFoundError"){
            account_obj.balances.forEach(function(entry) {
              if (entry.asset_code == params.asset_code) {
                balance = entry.balance;
              }                          
            });
          }
          window[params.to_id].value = balance;
          if (params.detail == true) {
            display_message(account_obj);
          }
          return account_obj;          
        }

      
       function get_balance(account,to_id,asset) {         
         get_account_info(account,{to_id:to_id,asset:asset},display_balance)
       } 
     
      function update_key() {
        key = StellarSdk.Keypair.fromSeed(seed.value);
        account.value = key.accountId();
      }
      
     

      function update_balances() {
        if (server_mode === "mss_server"){
          console.log("update_balances mss mode");
          get_balance_updates_mss();
          return
        }
       
        get_account_info(destination.value,{
          to_id1:"dest_balance",
          asset_code1:null,
          to_id2:"dest_CHP_balance",
          asset_code2:asset.value,
          detail:false
          },update_balances_set); 
        

        get_account_info(account.value,{
          to_id1:"balance",
          asset_code1:null,
          to_id2:"CHP_balance",
          asset_code2:asset_type.value,
          detail:true},update_balances_set);       
      }

      
      function createAccount(key) {
          console.log("start createAccount");
          var operation = createAccountOperation();
          createTransaction(key,operation);
        }

      function sendPaymentTransaction() {
        console.log("sendPaymentTransaction");
        var key = StellarSdk.Keypair.fromSeed(seed.value);
        if (asset.value== "native") {
          var asset_obj = new StellarSdk.Asset.native();
          if (dest_balance.value == 0){
            if (amount.value < 20) {
              message.textContent = "destination account not active must send min 20 native";
              return;
            }
            createAccount(key);
          }else {
            createPaymentTransaction(key,asset_obj);
          }
        }else {
          if (dest_balance.value == 0){
            message.textContent = "destination account not active, can only send native";
            return;
          }
          console.log("asset: " + asset.value + " issuer: " + issuer.value);
          var asset_obj = new StellarSdk.Asset(asset.value, issuer.value);
          message.textContent = "started payment: ";
          createPaymentTransaction(key,asset_obj);
        }        
      }    
  

      function createPaymentTransaction(key,asset_obj) {
          console.log("createPaymentTransaction");
          var operation = createPaymentOperation(asset_obj);
          createTransaction(key,operation);
        }

     function accountMergeTransaction() {
          // this will send all native of key from seed.value account to destination.value account
          update_key();
          console.log("accountMerge");        
          key = StellarSdk.Keypair.fromSeed(seed.value);
          console.log(key.accountId());
          var operation = accountMergeOperation();
          console.log("operation created ok");
          createTransaction(key,operation);
        }

     function submitTransaction_mss(transaction) {
       console.log("start submitTransaction_mss");
       var b64 = transaction.toEnvelope().toXDR().toString("base64");
       envelope_b64.value = b64;
       if (email_flag) {
         email_funds_now("email_funds");
         email_flag = false;
         return;
       }
       var action = '{"action":"send_b64", "envelope_b64":"' + b64 + '"}';
       socket.send(action);
     }

     function submitTransaction_mss_b64(b64_string) {
       var action = '{"action":"send_b64", "envelope_b64":"' + b64_string + '"}';
       socket.send(action);
     }

     function submitTransaction_horizon_b64(b64_string){
       var tx = new StellarSdk.Transaction(b64_string);
       server.submitTransaction(tx);
     }

     function get_seq(address) {
       var action = '{"action":"get_sequence", "account":"' + address + '"}'
       socket.send(action);
     }

     function createTransaction_mss_submit(operation,seq_num) {
       update_key();
       var account = new StellarSdk.Account(key.accountId(), seq_num);
       if (memo_mode.value == "auto") {
         if (isNaN(memo.value)) {
           var memo_tr = StellarSdk.Memo.text(memo.value);
         } else {
           var memo_tr = StellarSdk.Memo.id(memo.value);
         }
       } else if (memo_mode.value == "memo.id") {
         var memo_tr = StellarSdk.Memo.id(memo.value);
       } else {
         var memo_tr = StellarSdk.Memo.text(memo.value);
       }
       var transaction = new StellarSdk.TransactionBuilder(account,{fee:100, memo: memo_tr})            
           .addOperation(operation)          
           .build();
       transaction.sign(key);
       submitTransaction_mss(transaction); 
     }

     function createTransaction_mss(key,operation) {
       operation_globle = operation;
       get_seq(key.accountId());
     }

    function get_balance_updates_mss() {
      // this querys balance updates from the mss-server
      // see socket.addEventListener to see how the responces from this are feed 
      // to browser display boxes
      console.log("start get_balance_updates_mss");
      if (socket.readyState === 1) {
        var action = '{"action":"get_account_info","account":"';
        var tail = '"}';
        socket.send(action + account.value + tail);
        socket.send(action + destination.value + tail);
        var action = '{"action":"get_lines_balance","account":"';
        var tail = '"}';
        socket.send(action + account.value + '", "issuer":"' + tissuer.value + '", "asset":"' + asset_type.value + tail);
        socket.send(action + destination.value + '", "issuer":"' + issuer.value + '", "asset":"' +asset.value + tail);
      }
    }
     
      function sign_b64_tx(b64_tx,signer_key){
        var tx = new StellarSdk.Transaction(b64_tx);
        tx.sign(signer_key);
        return tx.toEnvelope().toXDR().toString("base64");
      }

      function createTransaction_horizon(key,operation) {
        update_key();
        console.log("memo.value typeof");
        console.log(typeof memo.value);
        console.log(memo.value.length);
        if (memo_mode.value == "auto") {
          if (isNaN(memo.value)|| memo.value.length == 0) {
            console.log("auto memo.text");
            var memo_tr = StellarSdk.Memo.text(memo.value);
          } else {
            console.log("auto memo.id");
            var memo_tr = StellarSdk.Memo.id(memo.value);
          }
        } else if (memo_mode.value == "memo.id") {
          console.log("manual memo.id");
          var memo_tr = StellarSdk.Memo.id(memo.value);
        } else {
          console.log("manual memo.text");
          var memo_tr = StellarSdk.Memo.text(memo.value);
        }
        server.loadAccount(key.accountId())
          .then(function (account) {
             console.log("memo_tr typeof");
             console.log(typeof memo_tr);
             transaction = new StellarSdk.TransactionBuilder(account,{fee:100, memo: memo_tr})            
            .addOperation(operation)                      
            .build();
            transaction.sign(key);
           if ( email_flag != true ) { 
             console.log("horizon mode sending tx");                               
             server.submitTransaction(transaction); 
           }          
          })
          .then(function (transactionResult) {
            console.log(transactionResult);
            //console.log(transaction.toEnvelope().toXDR().toString("base64"));
            envelope_b64.value = transaction.toEnvelope().toXDR().toString("base64");
            if ( email_flag ) {
              console.log("horizon mode email_flag detected");  
              email_funds_now ("email_funds");
              email_flag = false;
            }  
           
          })
          .catch(function (err) {
            console.log(err);
            email_flag = false; 
          });
        }
     
      function createTransaction(key,operation) {
        if (server_mode === "mss_server") {
          console.log("start mss trans");
          createTransaction_mss(key,operation);
        } else {
          createTransaction_horizon(key,operation);
        }
       
      }

      function fix7dec(string) {
        var num = Number(string).toFixed(7);
        string = num.toString();
        return string;
      }

      function createPaymentOperation(asset_obj) {
                 console.log("creatPaymentOperation");                 
                 return StellarSdk.Operation.payment({
                   destination: destination.value,
                   amount: fix7dec(amount.value),
                   asset: asset_obj
                 });
               }

      function createAccountOperation() {
                 return StellarSdk.Operation.createAccount({
                   destination: destination.value,
                   startingBalance: fix7dec(amount.value)
                 });
               }

      function accountMergeOperation() {
                 console.log(destination.value);
                 return StellarSdk.Operation.accountMerge({
                   destination: destination.value
                 });                                     
               }

      function addSignerOperation(secondAccountAddress,weight) {
                 return StellarSdk.Operation.setOptions({
                   signer: {
                     address: secondAccountAddress,
                     weight: weight
                   }
                 });
               }

      function addTrustlineOperation(asset_type, address) {
                 //asset_type examples "USD", "CHP"
                 asset = new StellarSdk.Asset(asset_type, address);
                 return StellarSdk.Operation.changeTrust({asset: asset}); 
               }

      function setOptionsOperation() {
                 var opts = {};
                 opts.inflationDest = "GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7";
                 opts.clearFlags = 1;
                 opts.setFlags = 1;
                 opts.masterWeight = 0;
                 opts.lowThreshold = 1;
                 opts.medThreshold = 2;
                 opts.highThreshold = 3;

                 opts.signer = {
                  address: "GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7",
                  weight: 1
                 };
                 opts.homeDomain = "www.example.com";
                 return StellarSdk.Operation.setOptions(opts);
               }

      function set_inflationDest() {
         update_key();
         var opts = {};
         opts.inflationDest = inflation_dest.value;
         var operation = StellarSdk.Operation.setOptions(opts);
         createTransaction(key,operation);
      }
    
      function create_socket() {
        console.log("started create_socket");
        open.disabled = true;
        close.disabled = false;
        var url_ws = url.value + ":" + port.value;
        console.log("url_ws: " + url_ws);
        socket = new WebSocket(url_ws, "echo-protocol");

        socket.addEventListener("open", function(event) {         
          open.disabled = true;
          close.disabled = false;
          status.textContent = "Connected";
        });

        // Display messages received from the mss-server
        // and feed desired responce to browser input boxes
        socket.addEventListener("message", function(event) {
          message.textContent = "Server Says: " + event.data;
          console.log(event.data);
          var event_obj = JSON.parse(event.data);          
          console.log("event_obj.action");
          console.log(event_obj.action);
          if (event_obj.action == "get_account_info") {          
            if (event_obj.accountid == account.value) {
              balance.value = event_obj.balance;
            }
            if (event_obj.accountid == destination.value) {
              dest_balance.value = event_obj.balance;
            }
          }
          if (event_obj.action == "get_lines_balance") {
            if (event_obj.accountid == account.value) {
              CHP_balance.value = event_obj.balance;
            }
            if (event_obj.accountid == destination.value) {
              dest_CHP_balance.value = event_obj.balance;
            }            
          }
          if (event_obj.action == "get_sequence") {
            var seq_num = (event_obj.sequence).toString();
            console.log("got sequence");
            console.log(seq_num);
            createTransaction_mss_submit(operation_globle, seq_num)
          }
          if (event_obj.action == "send_b64") {
            get_balance_updates_mss();
          }
        });

        // Display any errors that occur
        socket.addEventListener("error", function(event) {
          message.textContent = "Error: " + event;
        });

        socket.addEventListener("close", function(event) {
          open.disabled = false;
          close.disabled = true;
          status.textContent = "Not Connected";
        });

        socket.onopen = function (event) {
          console.log("got onopen event");
          get_balance_updates_mss();
        };

      }

      // Create a new connection when the Connect button is clicked
      open.addEventListener("click", function(event) {
        create_socket();
      });

      merge_accounts.addEventListener("click", function(event) {
        accountMergeTransaction();
      });


      // Close the connection when the Disconnect button is clicked
      close.addEventListener("click", function(event) {
        console.log("closed socket");
        close.disabled = true;
        open.disabled = false;
        message.textContent = "";
        socket.close();
      });
     
      change_network.addEventListener("click", function(event) { 
        console.log("mode: " + network.value);        
        if(network.value === "testnet" ) {
          server_mode = "horizon";
          close.disabled = true;
          open.disabled = true;
          StellarSdk.Network.useTestNetwork();
          //hostname = "horizon-testnet.stellar.org";
          current_mode.value = "Stellar horizon TestNet";
          console.log(socket);
          if (typeof(socket) !== "undefined") {
            socket.close();
          }
          reset_horizon_server();
          update_balances();
          start_effects_stream();
        }else if (network.value === "live" ){
          server_mode = "horizon";
          console.log("mode Live!!");  
          close.disabled = true;
          open.disabled = true;
          StellarSdk.Network.usePublicNetwork();
          //hostname = "horizon-live.stellar.org";
          
          current_mode.value = "Stellar horizon Live!!";
          console.log(socket);
          if (typeof(socket) !== "undefined") {
            socket.close();
          }
          reset_horizon_server();
          update_balances();
          start_effects_stream();
        }else if (network.value === "live_default" ){
          server_mode = "horizon";
          console.log("mode Live!!");  
          close.disabled = true;
          open.disabled = true;
          StellarSdk.Network.usePublicNetwork();
          url.value = "horizon-live.stellar.org";
          port.value = "443";
          secure.value = "true";
          current_mode.value = "Stellar horizon Live!! default";
          console.log(socket);
          if (typeof(socket) !== "undefined") {
            socket.close();
          }
          reset_horizon_server();
          update_balances();
          start_effects_stream();
        }else if (network.value === "testnet_default" ){
          server_mode = "horizon";
          console.log("mode testnet_default");  
          close.disabled = true;
          open.disabled = true;
          StellarSdk.Network.useTestNet();
          url.value = "horizon-testnet.stellar.org";
          port.value = "443";
          secure.value = "true";
          current_mode.value = "Stellar horizon testnet_default";
          console.log(socket);
          if (typeof(socket) !== "undefined") {
            socket.close();
          }
          reset_horizon_server();
          update_balances();
          start_effects_stream();
        }else if (network.value === "mss_server_live") {
          //mss-server mode
          server_mode = "mss_server";
          console.log("start mss-server LIVE! mode");          
          paymentsEventSource.close();
          server = false;
          close.disabled = false;
          console.log("here " + url.value.indexOf("horizon"));
          if (Number(url.value.indexOf("horizon")) == 0) {
            console.log("url had horizon at start so will set default");
            url.value = "ws://zipperhead.ddns.net";
            port.value = "9494";
            secure.value = "false";
          }
          //StellarSdk.Network.useTestNet();
          StellarSdk.Network.usePublicNetwork();
          create_socket();
          current_mode.value = "MSS-server LIVE! mode";
        }else  {
          //mss-server mode testnet
          server_mode = "mss_server";
          console.log("start mss-server testnet mode");          
          paymentsEventSource.close();
          server = false;
          close.disabled = false;
          console.log("here " + url.value.indexOf("horizon"));
          if (Number(url.value.indexOf("horizon")) == 0) {
            console.log("url had horizon at start so will set default");
            url.value = "ws://zipperhead.ddns.net";
            port.value = "9494";
            secure.value = "false";
          }
          StellarSdk.Network.useTestNet();
          create_socket();
          current_mode.value = "MSS-server TestNet";
        }     
        update_balances();          
      });
      
      function save_seed(seed_nick_name_, pass_phrase_, seed_ ) {
        if (typeof(Storage) !== "undefined") {
          var encrypted = CryptoJS.AES.encrypt(seed_, pass_phrase_);       
          // Store
          localStorage.setItem(seed_nick_name_, encrypted);
          //seed.value = "seed saved to local storage"        
        }else {
          message.textContent = "Sorry, your browser does not support Web Storage...";
        }
      }

      function restore_seed(seed_nick_name_, pass_phrase_) {
        if (typeof(Storage) !== "undefined") {
          // Retrieve
          console.log (typeof(seed_nick_name_));
          if (typeof(seed_nick_name_) == "undefined") {
            console.log("here");
            return;
          }
          console.log("getItem: " + seed_nick_name_);
          console.log("len: " + seed_nick_name_.length);
          var encrypted = localStorage.getItem(seed_nick_name_);
          console.log("encrypted: " + encrypted);
          //console.log("len: " + encrypted.length);
          if (encrypted != null) {
            try{
              var seed_ = CryptoJS.AES.decrypt(encrypted, pass_phrase_).toString(CryptoJS.enc.Utf8);
            }catch(e){
              console.log("error in decrypt");
              console.log(e);
              seed_ = "";
            }
          } else {
            seed_ = "";
          }
          return seed_
        }else {
          message.textContent = "Sorry, your browser does not support Web Storage...";
        }     
      }

      save.addEventListener("click", function(event) {         
        if (typeof(Storage) !== "undefined") {
          var encrypted = CryptoJS.AES.encrypt(seed.value, pass_phrase.value);       
          // Store
          localStorage.setItem(seed_nick.value, encrypted);
          seed.value = "seed saved to local storage"        
        }else {
          seed.value = "Sorry, your browser does not support Web Storage...";
        }
      });

      restore.addEventListener("click", function(event) {         
        if (typeof(Storage) !== "undefined") {
          // Retrieve
          var encrypted = localStorage.getItem(seed_nick.value);
          seed.value = CryptoJS.AES.decrypt(encrypted, pass_phrase.value).toString(CryptoJS.enc.Utf8);
          update_key();
          update_balances();
        }else {
          seed.value = "Sorry, your browser does not support Web Storage...";
        }        
      });

      delete_key.addEventListener("click", function(event) {
        // delete key_id from LocalStorage 
        console.log("deleting key "+ seed_nick.value);              
        localStorage.removeItem(seed_nick.value);
        message.textContent = "seed_nick: " + seed_nick.value + " deleted from LocalStorage";   
        //display_localstorage_keylist();        
      });

      function display_localstorage_keylist() {
        var result = "";
        for ( var i = 0, len = localStorage.length; i < len; ++i ) {
          //console.log(  localStorage.key( i ) );
          result = result + localStorage.key( i ) + ", ";
        }
        message.textContent = result;
      }

      list_seed_keys.addEventListener("click", function(event) {
        var result = "";
        for ( var i = 0, len = localStorage.length; i < len; ++i ) {
          //console.log(  localStorage.key( i ) );
          result = result + localStorage.key( i ) + ", ";
        }
        message.textContent = result;
      });

      gen_random_dest.addEventListener("click", function(event) {
        console.log("gen_random");         
        var new_keypair = StellarSdk.Keypair.random();
        destination.value = new_keypair.accountId();
        dest_seed.value = new_keypair.seed();
        update_balances();
        amount.value = 20.1;
        issuer.value = "";
        asset.value = "native";
        //save_seed("seed1", "", seed.value );
        save_seed("seed2", "", dest_seed.value )
      });
            
      send_payment.addEventListener("click", function(event) {
        console.log("send_payment clicked");                      
        sendPaymentTransaction();       
      });

      add_trustline.addEventListener("click", function(event) { 
        asset_type.value = tasset.value;         
        var operation = addTrustlineOperation(tasset.value, tissuer.value);
        createTransaction(key,operation);
      });

      set_inflation_dest.addEventListener("click", function(event) { 
        update_key();
        var opts = {};
        opts.inflationDest = inflation_dest.value;
        var operation = StellarSdk.Operation.setOptions(opts);
        createTransaction(key,operation);
      });
 
      swap_seed_dest.addEventListener("click", function(event) { 
        var seed_swap = seed.value;
        seed.value = dest_seed.value;
        dest_seed.value = seed_swap;         
        update_key();
        var temp_key = StellarSdk.Keypair.fromSeed(dest_seed.value);
        destination.value = temp_key.accountId();
        update_balances();
        save_seed("seed1", "", seed.value);
        save_seed("seed2", "", dest_seed.value);
        sign_tx.disabled = false;
      });

      decrypt_seed.addEventListener("click", function(event) {
        var temp = CryptoJS.AES.decrypt(seed.value, pass_phrase.value).toString(CryptoJS.enc.Utf8);
        console.log("length temp: " + temp.length);
        if (temp.length > 0) {
          seed.value = temp;
        } else {
          message.textContent = "bad pass phrase for decrypt_seed";
        }
      });

      encrypt_seed.addEventListener("click", function(event) {
        seed.value = CryptoJS.AES.encrypt(seed.value, pass_phrase.value);  
      });

      sign_tx.addEventListener("click", function(event) {
        update_key();
        var b64 = sign_b64_tx(envelope_b64.value,key);
        console.log("signer accountId: " + key.accountId());
        console.log("b64: " + b64);
        envelope_b64.value = b64;
        sign_tx.disabled = true;
      });


      send_tx.addEventListener("click", function(event) {
        if (server_mode == "mss_server") {
          console.log("send_tx mss_server mode");
          submitTransaction_mss_b64(envelope_b64.value);
        } else {
          console.log("send_tx horizon mode");
          console.log(envelope_b64.value);
          submitTransaction_horizon_b64(envelope_b64.value);
        }
      });

      email_funds.addEventListener("click", function(event) {
        // this will generate a transaction to send funds to
        // the destination accountID and seed will be included in the email of the body
        // it will then generate a transaction and add it as a link to the wallet in the body of the email
        // we will later make the transaction expire if demand exists
        email_flag = true;
        sendPaymentTransaction();
        sign_tx.disabled = false;
      });

      email_tx.addEventListener("click", function(event) {
        email_funds_now("email_tx");
      });

      fed_lookup.addEventListener("click", function(event) {
        console.log("x destination.value.length: " + destination.value.length);
        if ((destination.value.length == 56) && ( destination.value.charAt( 0 ) == 'G' )) {
          reverse_federation_lookup();
        } else {
          federation_lookup();
        }
      });

  });

