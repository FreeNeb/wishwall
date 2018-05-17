// 主网络地址
// var constractAddress = "n1qTiVz1gVEjvQzagBPvxChJbks9dALo1jr";
// var provider = "https://mainnet.nebulas.io";
// constracthash :5a12cd7585ba53f112ab1b633c6dc4bfea7a78dd27abd0ac23198820e3385011
// 测试地址
var constractAddress = "n1oWLHq4xurCReQdybLuLrWxhJEcovqdnZg";
// constracthash :c6eaaa20c2b9ba95eca6ac2e6e08c0912ca3e141d877c083d52684fc7f108cc3
var provider = "https://testnet.nebulas.io";
 
 // for test nebuls
 var nebulas = require("nebulas");
 var Account = nebulas.Account;
 var neb = new nebulas.Neb();
 
 neb.setRequest(new nebulas.HttpRequest(provider));
 var NebPay = require("nebpay"); //https://github.com/nebulasio/nebPay
 var nebPay = new NebPay(); 
 var serialNumber;

 // 根据输入参数，查询许愿清单
 var wall = "all"; // 'all': 总的许愿墙中，'my':我的许愿墙，其他是许愿墙的种类,'0':
 var to = constractAddress;
 var value = "0";

 // 控制分页数据
 var pageNum = 1;
 var pageSize = 10;
 var offset = 0;
 var total=0;

 function initPage() {
     pageNum = 1;
     pageSize = 10;
 }

 // common query
 function commonQuery() {
    getWishesCount(wall);
    removeContainerWishes();
     // wall = ""; //
     if (wall === "all") {
        queryWishes(offset, pageSize);
     } else if (wall === "my") {
        queryMyWishes(offset, pageSize);
     }
     else {
        queryWishesByType(wall,offset,pageSize);
     }
 }

 function onCreatWishClick() {
    var name = $('#name').val();
    if (!name || name ==="")  {
        alert("请输入昵称");
    }
    var type = $('#type').val();
    var content = $('#content').val();
    var anonymous = $('input[name="anonymous"]:checked').val();
    console.log("name =" +name+";type="+type+",content="+content+"anonymous="+anonymous);
    
    createWish(name,type, content, anonymous);
 }
 
 // 点击不同的许愿墙的点击事件
 function onEmotionWallClick() {
    console.log("onEmotionWallClick----");
    // $('#emotionWall').style.backgroundColor="#yellow";
    initPage();
    wall = "0";
    commonQuery() 
 }

 function onCareerWallClick() {
    console.log("onCareerWallClick----");
    initPage();
    wall = "1";
    commonQuery() 
 }

 function onLifeWallClick() {
    console.log("onLifeWallClick----");
    initPage();
    wall = "2";
    commonQuery() 
 }

 function onPegasuseWallClick() {
    console.log("onPegasuseWallClick----");
    initPage();
    wall = "3";
    commonQuery() 
 }

 function onMyWallClick() {
    initPage();
    wall="my";
    commonQuery() 
 }

 // 点击上一页事件
 function onPrePageClick() {
     if (pageNum === 1) {
        alert("已经是第一面墙了")
        return;
     }
     pageNum--;
     offset = (pageNum-1)*pageSize;
     commonQuery();
 }

 // 点击上下一页事件
 function onNextPageClick() {
     if (Math.ceil((total/pageSize)) < (pageSize+1)) {
        alert("已经是最后一墙了");
        return;
     }
     pageNum++
     // 暂时先不判断总的许愿数，后续待补
     offset = (pageNum-1)*pageSize;
     commonQuery();
 }


 function getWallectInfo(){
    window.postMessage({
        "target": "contentscript",
        "data": {},
        "method": "getAccount",
    }, "*");

    window.addEventListener('message', function (e) {
        if (e.data && e.data.data) {
            if (e.data.data.account) {//这就是当前钱包中的地址
                console.log(e.data.data.account)
                $('#address').text(e.data.data.account);
            }
            else {
                $('#address').text("请安装星云链Chrome钱包扩展，并导入钱包");
            }
        }
    });
}
 
 function displayWishes(res) {
    var result = JSON.parse(res.result); // 查看返回结果
    console.log("displayWishes: " + JSON.stringify(result))

    if (result == "null") {
        console.log("交易失败")
    } else {
        console.log("返回数据结果的长度="+result.length)
        for (var i = 0; i < result.length; i++) {
            createItem(result[i].content, result[i].timeStr || new Date().toDateString());
        }
    }
    var deployer = $('#deploy');
    if (deployer.hasClass('show')) {
        deployer.removeClass('show');
    } 
 }

 function getWishesCountCb(res) {
    console.log("getWishesCountCb: " + JSON.stringify(res.result))

 }

 function getWishesCount(type) {
    // simulateCall
    var callFunction = "getWishesCount";
    var callArgs = [];
    callArgs.push(type);
    console.log(JSON.stringify(callArgs));
    serialNumber = nebPay.simulateCall(to, value, callFunction, JSON.stringify(callArgs), {    //使用nebpay的call接口去调用合约,
            listener: getWishesCountCb        //设置listener, 处理交易返回信息
    });
     
 }

 function createWish(name, type, content, anonymous) {
    var callFunction = "createWish";
    var callArgs = [];
    callArgs.push(name);
    callArgs.push(type);
    callArgs.push(content);
    callArgs.push(anonymous);
    console.log(JSON.stringify(callArgs));
    serialNumber = nebPay.call(to, value, callFunction, JSON.stringify(callArgs), {    //使用nebpay的call接口去调用合约,
            listener: displayWishes        //设置listener, 处理交易返回信息
    });
 }

// 分页查询所有的非匿名愿望清单
 function queryWishes(offset, limit) {
    // simulateCall
    var callFunction = "queryWishesByPage";
    var callArgs = [];
    callArgs.push(offset);
    callArgs.push(limit);
    console.log(JSON.stringify(callArgs));
    serialNumber = nebPay.simulateCall(to, value, callFunction, JSON.stringify(callArgs), {    //使用nebpay的call接口去调用合约,
            listener: displayWishes        //设置listener, 处理交易返回信息
    });
 }

// 按类型去查询非匿名的愿望清单
 function queryWishesByType(type, offset, limit) {
    var callFunction = "queryWishesByType";
    var callArgs = [];
    callArgs.push(type);
    callArgs.push(offset);
    callArgs.push(limit);
    console.log(JSON.stringify(callArgs));
    serialNumber = nebPay.simulateCall(to, value, callFunction, JSON.stringify(callArgs), {    //使用nebpay的call接口去调用合约,
            listener: displayWishes        //设置listener, 处理交易返回信息
    });
 }

 // 根据用户地址查询用户的愿望，包括匿名的以及非匿名的
 function queryMyWishes(offset, limit) {
    var callFunction = "queryMyWishes";
    var callArgs = [];
    callArgs.push(offset);
    callArgs.push(limit);
    console.log(JSON.stringify(callArgs));
    serialNumber = nebPay.simulateCall(to, value, callFunction, JSON.stringify(callArgs), {    //使用nebpay的call接口去调用合约,
            listener: displayWishes        //设置listener, 处理交易返回信息
    });
 }


// 许愿页面逻辑控制
var container;
	// 可选颜色
var colors = ['#96C2F1', '#BBE1F1', '#E3E197', '#F8B3D0', '#FFCC00'];

//创建许愿页
var createItem = function(text, timeStr){
    var color = colors[parseInt(Math.random() * 5, 10)]
      $('<div class="item"><span style=\'font-size: 13px;font-family: fantasy;margin-left: 10px\'> ·  '+ (timeStr || '') +'</span><p>'+ text +'</p></div>').css({ 'background': color }).appendTo(container).drag();
      // $('<div class="item"><p>'+ text +'</p><a href="#">关闭</a></div>').css({ 'background': color }).appendTo(container).drag();

};

function removeContainerWishes() {
    $('#container').empty();
}

 // 加载执行
 (function ($) {
	
	// 定义拖拽函数
    $.fn.drag = function () {
		
        var $this = $(this);
        var parent = $this.parent();
		
        var pw = parent.width();
        var ph = parent.height();
        var thisWidth = $this.width() + parseInt($this.css('padding-left'), 10) + parseInt($this.css('padding-right'), 10);
        var thisHeight = $this.height() + parseInt($this.css('padding-top'), 10) + parseInt($this.css('padding-bottom'), 10);

        var x, y, positionX, positionY;
        var isDown = false; 

        var randY = parseInt(Math.random() * (ph - thisHeight), 10);
        var randX = parseInt(Math.random() * (pw - thisWidth), 10);


        parent.css({
            "position": "relative",
            "overflow": "hidden"
        });
		
        $this.css({
            "cursor": "move",
            "position": "absolute"
        }).css({
            top: randY,
            left: randX
        }).mousedown(function (e) {
            parent.children().css({
                "zIndex": "0"
            });
            $this.css({
                "zIndex": "1"
            });
            isDown = true;
            x = e.pageX;
            y = e.pageY;
            positionX = $this.position().left;
            positionY = $this.position().top;
            return false;
        });
		
		
        $(document).mouseup(function (e) {
            isDown = false;
        }).mousemove(function (e) {
            var xPage = e.pageX;
            var moveX = positionX + xPage - x;

            var yPage = e.pageY;
            var moveY = positionY + yPage - y;

            if (isDown == true) {
                $this.css({
                    "left": moveX,
                    "top": moveY
                });
            } else {
                return;
            }
            if (moveX < 0) {
                $this.css({
                    "left": "0"
                });
            }
            if (moveX > (pw - thisWidth)) {
                $this.css({
                    "left": pw - thisWidth
                });
            }
            if (moveY < 0) {
                $this.css({
                    "top": "0"
                });
            }
            if (moveY > (ph - thisHeight)) {
                $this.css({
                    "top": ph - thisHeight
                });
            }
        });
    };
	
	// 初始化
	var init = function () {
		
        container = $('#container');
        var deployer = $('#deploy');
		
		// 绑定关闭事件
		container.on('click','a',function () {
			$(this).parent().remove();
		}).height($(window).height() -204);

        // 默认加载许愿池
        commonQuery();
		getWallectInfo();

		$("#input").click(function(e) {
			if (deployer.hasClass('show')) {
				deployer.removeClass('show');
			} else {
				if (deployer.hasClass('deploy')){
				}else {
					deployer.addClass('deploy');

				}
				deployer.addClass('show');
			}
		});
		
	};
	
	$(function() {
		init();
	});
	
})(jQuery);