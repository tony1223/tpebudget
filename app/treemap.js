

var last_data = null;
function parseURL(val) {
    var result = "Not found",
        tmp = [];
    location.search
    //.replace ( "?", "" ) 
    // this is better, there might be a question mark inside
    .substr(1)
        .split("&")
        .forEach(function (item) {
        tmp = item.split("=");
        if (tmp[0] === val) result = decodeURIComponent(tmp[1]);
    });
    return result;
}
function initTreeMap() {
    $("#treemap-backbtn").hide();
    
    function setdebit(v) {
      var debit = $("#debitmask");
      debit.css({"top": v+"px", "height": (520-v)+"px", "line-height": (520-v)+"px"});
      debit.text(v+"億");
    }
    setdebit(123);
    mapforyear(2015, function(y2015){
      mapforyear(2016, function(y2016){
        var data;
        data = dataOverYears(2015, 2016, y2015, y2016);
        data = data.sort(function(a, b){
          return b.amount - a.amount;
        });
        last_data = data;
        select(null);
      });
    });    
    var kx = 1, ky = 1;
    var w = 710 - 80,
        h = 740 - 180,
        x = d3.scale.linear().range([0, w]),
        y = d3.scale.linear().range([0, h]),
        color = d3.scale.category20c(),
        root,
        node;

    var treemap = d3.layout.treemap()
        .round(false)
        .size([w, h])
        .sticky(true)
        .value(function(d) { return d.size; });

    var svg = d3.select("#treemap-root").append("div")
        .attr("class", "budget-treemap")
        .style("width", w + "px")
        .style("height", h + "px")
      .append("svg:svg")
        .attr("width", w)
        .attr("height", h)
        .attr("id", "treemap-svg")
      .append("svg:g")
        .attr("transform", "translate(.5,.5)");

    var CurrencyData = [
	  ["", "元", 1],
	  ["份","營養午餐",25],
	  ["份","營養午餐(回扣)",30],
	  ["人的","年薪",308000],
	  ["分鐘","太空旅遊",1000000],
	  ["碗","鬍鬚張魯肉飯",68],
	  ["個","便當",50],
	  ["杯","珍奶",30],
	  ["份","雞排加珍奶",60],
	  ["個","夢想家",200000000],
	  ["座","冰島",2000080000000],
釣魚台	  ["次","北市重陽敬老禮金",770000000],
	  ["支","iPhone5",25900],
	];

	function _num(val,divide,floats){
		return parseInt( (val/divide) * Math.pow(10,floats),10)/ Math.pow(10,floats);
	};
    function CurrencyConvert(v,idx,full) {
      if(idx==undefined) idx = 0;
      var c = CurrencyData[idx];
      v = parseInt(10000*v/c[2])/10000;
      if(v>1 && v<1000) v=parseInt(10*v)/10;
      if(v>=1000 && v<10000) v=parseInt(v/1000)+"千";
      else if(v>=10000 && v<100000000) v= parseInt(v/10000)+"萬";
      else if(v>=100000000 && v<1000000000000) v=_num(v,100000000,2)+"億";
      else if(v>=1000000000000) v=_num(v,1000000000000,2)+"兆";
      return v+(full?c[0]+c[1]:"");
    }
    var lastcell = null;
    var lockcell = null;

    function clickNode(d){
       if(lockcell && lockcell.find) lockcell.find("rect").css({"stroke": "none"});
       if(!lockcell || lockcell.get(0)!=$(this).get(0)) {
         $(this).find("rect").css({"stroke": "rgb(255,0,0)"});
         lockcell = $(this), lastcell = d;
         update_detail_amount();
         select(lastcell);

         var scope = angular.element("#BudgetItem").scope()
         scope.$apply(function() { scope.key="view3:"+d.cat+":"+d.name; });
       } else { lockcell=null; }
       if(node!=d.parent) {
         $("#treemap-backbtn").show();
         return zoom(d.parent);
       } 
    }    
    function foo(data) {
      node = root = data;

      var nodes = treemap.nodes(root)
          .filter(function(d) { return !d.children; });
      var cell = svg.selectAll("g.cell")
          .data(nodes)
        .enter().append("svg:g")
          .attr("class", "cell")
          .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
          .on("mouseover", function(d) {
             var i;
             if(lockcell || d==lastcell) return; else lastcell=d;
             update_detail_amount();
             var scope = angular.element("#BudgetItem").scope()
             scope.$apply(function() { scope.key="view3:"+d.cat+":"+d.name; });
          })
          .on("click", clickNode);
      var _k=1, _n=1;
      var _n = svg.selectAll("g.cell")[0].length;
      svg.selectAll("g.cell").filter(function(d,i) {
        if(parseInt(Math.random()*_n)==_k-1) {
          _k--;
          lastcell = d;
          update_detail_amount();
        } _n--;
      });
      cell.append("svg:rect")
          .attr("width", function(d) { return (d.dx>1?d.dx - 1:0); })
          .attr("height", function(d) { return (d.dy>1?d.dy - 1:0); })
          .style("fill", function(d) { return color(d.parent.name); });

      var texts = cell.append("svg:g").attr("class", "texts");
      texts.append("svg:text")
          .attr("class", "name")
          .attr("x", function(d) { return d.dx / 2; })
          .attr("y", function(d) { return d.dy / 2-7; })
          .attr("dy", ".35em")
          .attr("text-anchor", "middle")
          .text(function(d) { return d.name; });
      texts.append("svg:text")
          .attr("class", "amount")
          .attr("x", function(d) { return d.dx / 2; })
          .attr("y", function(d) { return d.dy / 2+7; })
          .attr("dy", ".35em")
          .attr("text-anchor", "middle")
          .text(function(d) { return CurrencyConvert(d.size, budget_unit, true); });
      texts.style("display", function(d) { return textSize(d,this,["block","none"]); });

      d3.select("#treemap-backbtn").on("click",function() { zoom(root); $("#treemap-backbtn").hide(); });
    };
    function size(d) {
      return d.size;
    }

    function count(d) {
      return 1;
    }

    var dx = 0;

    function select(cell){
      if(last_data){
        console.log(cell);
        // $("#budget-detail-depname-field").text(lastcell.name);
        // $("#budget-detail-category-field").text(lastcell.cat);

        // alt_unit = (UnitMapper.get()==0?parseInt(Math.random()*(CurrencyData.length-1))+1:0);
        // $("#budget-detail-amount-field1-value").text(
        //   UnitMapper.convert(lastcell.size) + UnitMapper.getQuantifier());
        // $("#budget-detail-amount-field1-unit").text(UnitMapper.getUnit());
        // $("#budget-detail-amount-field2").text(UnitMapper.convert(lastcell.size, alt_unit, true));

        var out = [];
        out.push("<hr /><table class='table table-bordered'>");
        // 款  項 目 節
        out.push("<tr><td class='span1'>年份</td><td class='span1'>代碼</td>",
          "<td class='span1'>款</td>",
          "<td class='span1'>項</td>",
          "<td class='span2'>目</td>",
          "<td class='span2'>名稱</td>",
          "<td class='span2'>金額</td>",
          "<td class='span2'>前一年差額</td>",
          "<td class='span2'>細節</td>",
          "</tr>");
        for(var i = 0 ; i < last_data.length;++i){
          var d = last_data[i];
          if( cell && !(cell.cat == d.topname || cell.name == d.topname) ){
            continue;
          }
          // if( cell &&  cell.cat  && d.depname != cell.name){
            // continue;
          // }
          var domID = d.code.replace(/\./gi,"-");
          out.push("<tr><td>",d.year,"</td><td>",
            d.code.split("-")[1],"</td><td>",
            d.topname,"</td><td>",
            d.depname,"</td><td>",
            d.category,"</td><td>",
            d.name,"</td><td>",
            UnitMapper.convert(d.amount, null, true),"</td>",
            "<td> ", 
              "<span style='color:",(d.change == 0 ? "black" :d.change > 0 ? "red" :"green"),"'>",
              d.amount && [(d.change > 0 ? "+" :"") , parseInt(d.change *100 * 100,10)/100 ,"%"].join("") ,
              "<br /> (約差 ",
              UnitMapper.convert(d.amount - d.last_year, null, true),")</td>",
            "<td><button  onclick=\"$('#info-",domID,
              "')[0].style.display=='none' ?$('#info-",
              domID, 
              "').show():$('#info-" , domID , "').hide(); \" class='btn'>看更多細節</button></td>",
          "</tr>",
          "<tr id='info-", domID ,"' style='display:none;'><td></td><td colspan='9'>",d.comment_html,"</td></tr>"
          );
        };
        
        out.push("</table>");
        $("#budget-change-detail").html(out.join(""));
      }
    }

    function zoom(d,init) {

      var isRoot = d.name == "root";
      if(!isRoot){
        select(d);
        console.log(d);

        // if(!init){
        //   if(window.history.pushState){
        //     window.history.pushState(null,document.title,'http://'+window.location.host+'/view3/'+(d.cat||"dep")+"/"+(d.name||""));
        //   }
        // }
      }else{
        select(null);

        // if(!init){
        //   if(window.history.pushState){
        //     // window.history.pushState(null,document.title,'http://'+window.location.host+'/view3/');
        //   }
        // }
      }
      // console.log(d);
      kx = w / d.dx, ky = h / d.dy;
      x.domain([d.x, d.x + d.dx]);
      y.domain([d.y, d.y + d.dy]);

      var t = svg.selectAll("g.cell").transition()
          .duration(750)
          .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });

      t.select("rect")
          .attr("width", function(d) { return (kx*d.dx>1?kx * d.dx - 1:0); })
          .attr("height", function(d) { return (ky*d.dy>1?ky * d.dy - 1:0); })

      t.select("text.name")
          .attr("x", function(d) { return (kx * d.dx / 2 ); })
          .attr("text-anchor", function(d) { 
            if(isRoot){
              return "middle";
            }
            return (kx * d.dx / 2 ) < 30?"left":"middle"; 
          })
          .attr("y", function(d) { return ky * d.dy / 2 - 7; });

      t.select("text.amount")
          .attr("x", function(d) { return kx * d.dx / 2; })
          .attr("text-anchor", function(d) { 
            if(isRoot){
              return "middle";
            }            
            return (kx * d.dx / 2 ) < 30 ?"left":"middle"; 
          })
          .attr("y", function(d) { 
            return ky * d.dy / 2 + 7; 
          });

      svg.selectAll("g.texts")
      .transition().style("display", function(d) { return textSize(d,this,["block",$(this).css("display")]);  })
      .transition().duration(250).style("opacity", function(d) { 
        return textSize(d,this,[1,1]); 
      })
      .transition().delay(250).style("display", function(d) { 
        if(!isRoot){
          return "block";
        }
        // return "block"; 
        return textSize(d,this,["block","none"]); 
      });

      node = d;
      d3.event.stopPropagation();
    }

    var unit_selector;
    var budget_unit=0;
    function textSize(d,item, values) {
      if(d.cat == "社會局主管"){
        return values[0];
      }
        if(kx*d.dx+5 > item.childNodes[0].getComputedTextLength() 
         && kx*d.dx+5 > item.childNodes[1].getComputedTextLength()
         && ky*d.dy>20) return values[0];
        else return values[1];
    }

    var datas = $.get("http://tony1223.github.io/ks-budget-convert/output/%E6%AD%B2%E5%87%BA%E6%A9%9F%E9%97%9C%E5%88%A5%E9%A0%90%E7%AE%97%E8%A1%A8_g0v_drilldown.json",function(raw){
      parse(raw);
      foo(datas);
      var uname = null,ucat = null;
      if( (ucat = parseURL("cat")) || (uname = parseURL("name"))){
        $.each(datas.children,function(ind,data){
          if(data.name == uname){
            clickNode(data);
          }
          $.each(data.children,function(ind,data){
            if(data.name == uname){
              clickNode(data);
            }
          });
        });
      }
      $(document).ready(function() { UnitMapper.onchange(update_unit); })
    });
    


    function update_unit(idx) {
      //unit_selector=$("#unit-selector"); // move to sth like $(doc).ready
      /*
      if(budget_unit>=0) $("#unit-selector li:eq("+budget_unit+") a i").css({"visibility":"hidden"});
      if(idx==-1) {
        budget_unit = parseInt(Math.random()*CurrencyData.length);
        $("#unit-selector li:eq("+budget_unit+") a i").style("display","inline-block");
      } else if(idx==undefined) budget_unit = unit_selector.val();
      else budget_unit = idx;
      $("#unit-selector li:eq("+budget_unit+") a i").css({"visibility":"visible"});
      update_detail_amount();
      d3.selectAll("text.amount").text(function(d) {
        return CurrencyConvert(d.size, budget_unit, true);
      });*/
      update_detail_amount();
      svg.selectAll("g.texts")
      .transition().style("display", function(d) { return "block";  })
      .transition().duration(750).style("opacity", function(d) { return textSize(d,this,[1,0]); })
      .transition().delay(750).style("display", function(d) { return textSize(d,this,[$(this).css("display"),"none"]); });
    }

    function update_detail_amount() {
      if(lastcell) {
        $("#budget-detail-depname-field").text(lastcell.name);
        $("#budget-detail-category-field").text(lastcell.cat);

        alt_unit = (UnitMapper.get()==0?parseInt(Math.random()*(CurrencyData.length-1))+1:0);
        $("#budget-detail-amount-field1-value").text(
          UnitMapper.convert(lastcell.size) + UnitMapper.getQuantifier());
        $("#budget-detail-amount-field1-unit").text(UnitMapper.getUnit());
        $("#budget-detail-amount-field2").text(UnitMapper.convert(lastcell.size, alt_unit, true));

        /*alt_unit = (budget_unit==0?parseInt(Math.random()*(CurrencyData.length-1))+1:0);
        $("#budget-detail-amount-field1-value").text(
          CurrencyConvert(lastcell.size,budget_unit)+CurrencyData[budget_unit][0]);
        $("#budget-detail-amount-field1-unit").text(CurrencyData[budget_unit][1]);
        $("#budget-detail-amount-field2").text(CurrencyConvert(lastcell.size, alt_unit)+
          CurrencyData[alt_unit][0]+CurrencyData[alt_unit][1]);*/
      }
    }


}
