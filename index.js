const snmp = require('net-snmp')

var express = require('express');
var app = express();


//----------------------------------
 var sqlite3 = require('sqlite3').verbose();
// var db = new sqlite3.Database('db.sqlite3');

// db.serialize(function() {
//  //db.run("CREATE TABLE graph (takenAVG REAL, givenAVG REAL)");

//   var stmt = db.prepare("INSERT INTO graph VALUES (?, ?)");

//   stmt.run(2, 3);
//   stmt.finalize();
  
//   db.each("SELECT rowid AS id, takenAVG, givenAVG FROM graph", function(err, row) {
//       console.log(row.id + ": " + row.takenAVG + 'asd'+row.givenAVG);
//   });
// });

// db.close();

//----------------------------------


app.use(express.static(__dirname + '/public'));

app.listen(3000, function() {
  console.log('listening');
});

app.get('/', (req, res)=>{
    res.sendFile('public/index.html')
})
var idToDel = 0
var delayToDel = 0
var done = false

var allItemsGivenAVGTo= []
var allItemsTakenAVGTo= []
var allItemsGivenAVGTo2= []
var allItemsTakenAVGTo2= []
var statusCode = []
var names = []
app.get('/data', (req, res)=>{
    res.json({dataTaken: allItemsTakenAVGTo2, dataGiven: allItemsGivenAVGTo2, status: statusCode, names: names, takenAll: allItemsTakenAVGToAll, givenAll: allItemsGivenAVGToAll})
})

var options = {
    port: 161,
    retries: 1,
    timeout: 5000,
    backoff: 1.0,
    transport: "udp4",
    trapPort: 162,
    version: snmp.Version2c,
    backwardsGetNexts: true,
    idBitsSize: 32
}

var counterTaken = 0
var counterGiven = 0;

function matrixArray(rows,columns){
    var arr = new Array();
    for(var i=0; i<rows; i++){
      arr[i] = new Array();
      for(var j=0; j<columns; j++){
        arr[i][j] = i+j+1;//вместо i+j+1 пишем любой наполнитель. В простейшем случае - null
      }
    }
    return arr;
  }

  var prevIn = [0,0,0]
  var prevOut = [0,0,0]
  var allItemsTaken= 0
  var allItemsGiven= 0
  var allItemsTakenAVG =[]
  var allItemsGivenAVG =[]
  
  var oidsStatus = ['1.3.6.1.2.1.2.2.1.8.2']
  var oidsName = ['1.3.6.1.2.1.2.2.1.2.2']
  var oidsTaken = ['1.3.6.1.2.1.31.1.1.1.6.2']
  var oidsGiven = ['1.3.6.1.2.1.31.1.1.1.10.2']

  var oidsStatusPattern = ['1.3.6.1.2.1.2.2.1.8.']
  var oidsNamePattern = ['1.3.6.1.2.1.2.2.1.2.']
  var oidsTakenPattern =['1.3.6.1.2.1.31.1.1.1.10.']
  var oidsGivenPattern = ['1.3.6.1.2.1.31.1.1.1.10.']
  var testOidsNum = 2
  var iter =0
  var crm = 8630
  var firstCycle = true
  var notPop = true

  var allItemsGivenAVGToAll =  []
  var allItemsTakenAVGToAll =  []
 
var d=  new setInterval(()=>{
    const testSession = snmp.createSession('172.16.16.100', 'public', options)
        
    testSession.get(oidsGiven, (e,v)=>{
        if (e){
            console.log(e);
        } else {
            if(snmp.isVarbindError(v[iter])){
                if(firstCycle){
                    console.error(snmp.varbindError(v[iter]));
                    oidsTaken.pop()
                    oidsGiven.pop()
                    oidsName.pop()
                    oidsStatus.pop()
                    firstCycle = false
                    //console.log(oidsGiven);
                    // allItemsTaken = matrixArray(oidsTaken.length, 0) //
                    // allItemsGiven = matrixArray(oidsTaken.length, 0) //
                    //clearInterval(d)
                    //console.log(oidsTaken.length);
                    iter--
                    testOidsNum = crm
                } else if(!firstCycle){
                    console.error(snmp.varbindError(v[iter]));
                    if(notPop){
                        oidsTaken.pop()
                        oidsGiven.pop()
                        oidsName.pop()
                        oidsStatus.pop()
                        notPop = false
                        iter-- 
                    }

                    testOidsNum ++

                    console.log(oidsTaken.length);
                    allItemsTaken = matrixArray(oidsTaken.length, 0) //
                    allItemsGiven = matrixArray(oidsTaken.length, 0) //
                    
                }
             
            } else{
                //iter++
                testOidsNum ++
                    if(firstCycle){
                        console.log('sdf');
                        iter++
                       
                        oidsTaken.push(oidsTakenPattern+ testOidsNum)
                        oidsGiven.push(oidsGivenPattern+ testOidsNum)
                        oidsName.push(oidsNamePattern+ testOidsNum)
                        oidsStatus.push(oidsStatusPattern+ testOidsNum)
                    } else if (!firstCycle){
                        iter++
                        console.log(oidsName.length);
                        notPop = true
                        oidsTaken.push(oidsTakenPattern+ testOidsNum)
                        oidsGiven.push(oidsGivenPattern+ testOidsNum)
                        oidsName.push(oidsNamePattern+ testOidsNum)
                        oidsStatus.push(oidsStatusPattern+ testOidsNum)
                        console.log(v);
                        allItemsTaken = matrixArray(oidsTaken.length, 0) //
                        allItemsGiven = matrixArray(oidsTaken.length, 0) //
                        //console.log(v);
                        // oidsTaken.push(oidsTakenPattern+ testOidsNum)
                        // oidsGiven.push(oidsGivenPattern+ testOidsNum)
                        // oidsName.push(oidsNamePattern+ testOidsNum)
                        // oidsStatus.push(oidsStatusPattern+ testOidsNum)
                        
                    }
                //console.log(oidsGiven);
            }
        }
        testSession.close()
    })

},100)


    
function get (){
  console.log('sdf');
  clearInterval(d)
    
    //console.log(allItemsTaken);
    const sessionName = snmp.createSession('172.16.16.100', 'public', options)

    sessionName.get(oidsName, (e,v)=>{
        if (e){
            console.log(e);
        } else {
            for (var i = 0; i < oidsName.length-1; i++){
                names[i] = v[i].value.toString()
                //console.log(names);
            }
        }
        sessionName.close()
    })
    
    const sessionStatus = snmp.createSession('172.16.16.100', 'public', options)

    
    sessionStatus.get(oidsStatus, (e, v)=>{
        if (e){
            console.log(e);
        } else {
            for (var i = 0; i < oidsStatus.length-1; i++){
                statusCode[i] = v[i].value
            }
        }
        sessionStatus.close()
    })
   

    const sessionTaken = snmp.createSession('172.16.16.100', 'public', options)
    
    sessionTaken.get(oidsTaken, (e, v)=>{
        if (e){
            console.log(e);
        } else {
            for (var i = 0; i < oidsTaken.length-1; i++){
                 if(counterTaken <= 4 && counterTaken!==-1){
                    allItemsTaken[i][counterTaken] = (((parseInt(v[i].value.toString('hex'),16) - prevIn[i]) / 8 / 1024) /10).toFixed(2)
                    prevIn[i] = parseInt(v[i].value.toString('hex'),16)
                    
                 }else if (counterTaken > 4){
                     counterTaken = 2
                     for (var c = 0; c < oidsTaken.length-1; c++ ){
                         allItemsTakenAVG[c] = ((parseFloat(allItemsTaken[c][0])+parseFloat(allItemsTaken[c][1])+parseFloat(allItemsTaken[c][2])+parseFloat(allItemsTaken[c][3])+parseFloat(allItemsTaken[c][4])) / 5).toFixed(2)
                         allItemsTakenAVGTo[c] = allItemsTakenAVG[c]
                         allItemsTaken[c][0] = allItemsTaken[c][2]
                         allItemsTaken[c][1] = allItemsTaken[c][3]
                         allItemsTaken[c][2] = allItemsTaken[c][4]
                         allItemsTaken[c][3] = 0
                         allItemsTaken[c][4] = 0
                     }
                 }
            }
            
            ++counterTaken
        }
        sessionTaken.close()
    })

     const sessionGiven = snmp.createSession('172.16.16.100', 'public', options)



     sessionGiven.get(oidsGiven, function (e, v){
        if (e){
            console.log(e);
        }
            // for(var i = 0;  i < v.length; i++){
            //     if (snmp.isVarbindError(v[i])){
            //         console.error(snmp.varbindError(v[i]));
                    
            //     } 
            else {
                for (var i = 0; i < oidsGiven.length-1; i++){
                    // console.log((((parseInt(v[i].value.toString('hex'),16) - prevIn[i]) / 8 / 1024) /5).toFixed(2));
                    
                    if(counterGiven <= 4 && counterGiven!==-1){
                    allItemsGiven[i][counterGiven] = (((parseInt(v[i].value.toString('hex'),16) - prevOut[i]) / 8 / 1024) /10).toFixed(2)
                    prevOut[i] = parseInt(v[i].value.toString('hex'),16)
                    
                    }else if (counterGiven > 4){
                        counterGiven = 2
                        for (var c = 0; c < oidsGiven.length-1; c++ ){
                            allItemsGivenAVG[c] = ((parseFloat(allItemsGiven[c][0])+parseFloat(allItemsGiven[c][1])+parseFloat(allItemsGiven[c][2])+parseFloat(allItemsGiven[c][3])+parseFloat(allItemsGiven[c][4])) / 5).toFixed(2)
                            allItemsGivenAVGTo[c] = allItemsGivenAVG[c]
                            allItemsGiven[c][0] = allItemsGiven[c][2]
                            allItemsGiven[c][1] = allItemsGiven[c][3]
                            allItemsGiven[c][2] = allItemsGiven[c][4]
                            allItemsGiven[c][3] = 0
                            allItemsGiven[c][4] = 0
                           
                        }
                 
                        idToDel = idToDel + allItemsGivenAVGTo.length
                        
                    }
                }
                ++counterGiven
            }
        
        
        sessionGiven.close()
    })
    var chache2 = []
    var chache3 = []
    // sessionGiven.trap (snmp.TrapType.LinkDown, (e)=>{
    //     if (e){
    //         console.log(e);
    //     }
    // })

    if (allItemsGivenAVGTo.length > 0){
        var dbIn = new sqlite3.Database('db.sqlite3');
    dbIn.serialize(function() {
        //dbIn.run("CREATE TABLE graph (takenAVG REAL, givenAVG REAL)");
       
         var stmt = dbIn.prepare("INSERT INTO graph VALUES (?, ?)");
        for (var i = 0; i < allItemsGivenAVGTo.length; i++){
        //  /stmt.run(allItemsGivenAVGTo[i], allItemsTakenAVGTo[i]);
         stmt.run(allItemsTakenAVGTo[i], allItemsGivenAVGTo[i]);
        }
         stmt.finalize();
         
    
         dbIn.each("SELECT rowid AS id, takenAVG, givenAVG FROM graph", function(err, row) {
            
            //  console.log(row.id + ": " + row.takenAVG + ' asd '+row.givenAVG);
             chache2.push(row.givenAVG)
             chache3.push(row.takenAVG)
            //  allItemsTakenAVGToAll[j].push(row.takenAVG)
            //  allItemsGivenAVGToAll[j][i] = row.givenAVG
            

         });
         allItemsGivenAVGTo2 = chache2
         allItemsTakenAVGTo2 = chache3
         allItemsGivenAVGToAll.push(chache2)
         allItemsTakenAVGToAll.push(chache3)
         
         console.log(allItemsTakenAVGToAll[allItemsGivenAVGToAll.length-1]);
         console.log(allItemsGivenAVGToAll[allItemsGivenAVGToAll.length-1]);
         if (allItemsGivenAVGToAll.length > 20){
             allItemsGivenAVGToAll.splice(0, 1)
             allItemsTakenAVGToAll.splice(0, 1)
             //console.log(allItemsGivenAVGToAll);
         }
         //console.log(allItemsTakenAVGToAll);
         //console.log(allItemsGivenAVGToAll);
        // console.log('__________________________________');
        
         var del = dbIn.prepare("DELETE FROM graph WHERE rowid < (?)")
         del.run(idToDel+1)
         del.finalize()
         
         
       });
       
       dbIn.close();
    }
}



setInterval(()=>get(), 10000)
 
