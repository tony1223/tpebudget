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

_num = (val,divide,floats) ->
  parseInt(val/divide * Math.pow(10,2),10) / Math.pow(10,floats)

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
    v = _num(v,100000000,2)+"億"
  else v = _num(v,1000000000000,2)+"兆" if v >= 1000000000000
  v + (if full then c[0] + c[1] else "")
