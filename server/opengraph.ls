@include = ->
  fs = require \fs
  request = require \request

  CurrencyData = [
    ["", "元", 1],
    ["份","營養午餐",25],
    ["人的","年薪",308000],
    ["分鐘","太空旅遊",1000000],
    ["碗","鬍鬚張魯肉飯",68],
    ["個","便當",50],
    ["杯","珍奶",30],
    ["份","雞排加珍奶",60],
    ["個","夢想家",200000000],
    ["座","冰島",2000080000000],
    ["次","北市重陽敬老禮金",770000000],
    ["支","iPhone5",25900],
  ];

  CurrencyConvert = (v, idx, full) ->
    idx ?= 0
    c = CurrencyData[idx]
    v = parseInt(10000 * v / c[2]) / 10000
    v = parseInt(10 * v) / 10  if v > 1 and v < 1000
    if v >= 1000 and v < 10000
      v = parseInt(v / 1000) + "千"
    else if v >= 10000 and v < 100000000
      v = parseInt(v / 10000) + "萬"
    else if v >= 100000000 and v < 1000000000000
      v = parseInt(v / 100000000) + "億"
    else v = parseInt(v / 1000000000000) + "兆"  if v >= 1000000000000
    v + (if full then c[0] + c[1] else "")
  
  @loadCsv = (fn, cb) ->
    request fn, (err,data) ->
      data = data.toString()
      hash = {}
      if err then return console.log err
      arr = data.split '\n' .filter (e,i,a) ->
        e.length>0
      for i from arr.length-1 to 0 by -1
        arr[i] = arr[i].split \,
        hash[arr[i][1]] = arr[i]
      cb(hash)

  @getOpenGraph = (hash, code) ->
    item = hash[code]
    ret =
      og_title: ""
      og_url: ""
      og_description: ""
    if !item then return ret
    ret.og_title = " : 預算項目「" + item[3] + "」(屬於" + item[4] + " > " + item[5] + " > " + item[6] + ")"
    ret.og_url = "budget/"+code
    ret.og_description = "【"+item[4]+" > " + item[5] + " > " + item[6] + " > " + item[3] + "】的年度預算為" + CurrencyConvert(item[2],0,true) + ", 相當於" + (CurrencyConvert item[2],parseInt(Math.random!*CurrencyData.length),true) + ", 也等於" + (CurrencyConvert item[2],parseInt(Math.random!*CurrencyData.length),true)
    return ret;

