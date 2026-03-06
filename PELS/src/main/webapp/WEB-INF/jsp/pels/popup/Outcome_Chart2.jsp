<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/pels/include/common.jspf"%>
<script type="text/javascript">	
	let outcomeChartList;
	let titlNm;
	let th1ItmNm;
	let th2ItmNm;
	let th3ItmNm;
	let title;
	
	$(document).ready(function () {
		titlNm = '${TITL_NM}';		// 제목
		th1ItmNm = '${TH1_ITM_NM}';	// 분류1
		th2ItmNm = '${TH2_ITM_NM}' == '' ? '' : ' / ' + '${TH2_ITM_NM}';	// 분류2
		th3ItmNm = '${TH3_ITM_NM}' == '' ? '' : ' / ' + '${TH3_ITM_NM}';	// 분류3
		outcomeChartList = '${jsonArray}';
		outcomeChartList = JSON.parse(outcomeChartList.replaceAll('\t', ''));	
		fnDataSet();
	})
		
	rMateChartH5.create("chart1", "chartHolder", "", "98%", "90%");
	
	function fnDataSet () {			
		var layoutStr =
	         '<rMateChart  backgroundColor="#ffffff" borderStyle="none">'
	              +'<Options>'
	                  +'<Caption text="'+titlNm+'"/>'
	                  +'<SubCaption text="'+ th1ItmNm +''+ th2ItmNm +''+ th3ItmNm +'" paddingTop="5"/>'
	                   +'<Legend useVisibleCheck="true"/>'
	               +'</Options>'
	             +'<Line2DChart showDataTips="true" dataTipDisplayMode="axis" paddingTop="0" dataTipJsFunction="dataTipFunc">'
	                 +'<horizontalAxis>'
	                       +'<CategoryAxis categoryField="RG_DT" padding="0.2"/>'
	                    +'</horizontalAxis>'
	                  +'<verticalAxis>'
	                  		+'<LinearAxis id="vAxis" title=" "/>'
	                  +'</verticalAxis>'
	                    +'<series>' 
	                       /*
	                      itemRenderer는 Tip이 보여지는 영역차트 부분에 ItemRenderer에서 제공하는 모양을 그려줍니다 이 예제에서는 Diamond입니다 사용할 수 있는 도형을 모두 표현한 예제는 Chart Samples 의 범례 예제를 참고하십시오.
	                      */
	                      +'<Line2DSeries yField="AGMST_VAL" fill="0xEFEFEF" radius="5" displayName="측정시험값" itemRenderer="RectangleItemRenderer" >'		                      	                    
	                           +'<showDataEffect>'
	                               +'<SeriesInterpolate/>'
	                           +'</showDataEffect>'
	                      +'</Line2DSeries>'
	                    +'</series>'                    
	                  +'<annotationElements>'
	                       +'<CrossRangeZoomer zoomType="horizontal" fontSize="11" color="#FFFFFF" verticalLabelPlacement="bottom" horizontalLabelPlacement="left" enableZooming="false" enableCrossHair="true">'
	                        +'</CrossRangeZoomer>'
	                    +'</annotationElements>'
	              +'</Line2DChart>'
	         +'</rMateChart>';
			 		
		var arrayList = new Array();
	             
		for(var i = 0; i < outcomeChartList.length; i++){
			var data = new Object();
			
			data.RG_DT = outcomeChartList[i].FM_RG_DT
			data.AGMST_VAL = outcomeChartList[i].AGMST_VAL
			
			arrayList.push(data);
		}
			
		// rMateChartH5.calls 함수를 이용하여 차트의 준비가 끝나면 실행할 함수를 등록합니다.
		//
		// argument 1 - rMateChartH5.create시 설정한 차트 객체 아이디 값
		// argument 2 - 차트준비가 완료되면 실행할 함수 명(key)과 설정될 전달인자 값(value)
		// 
		// 아래 내용은 
		// 1. 차트 준비가 완료되면 첫 전달인자 값을 가진 차트 객체에 접근하여
		// 2. 두 번째 전달인자 값의 key 명으로 정의된 함수에 value값을 전달인자로 설정하여 실행합니다.
		rMateChartH5.calls("chart1", {
		 	"setLayout" : layoutStr,
		    "setData" : arrayList
		});	
	}	
	
	function rMateChartH5ChangeTheme(theme){
	    document.getElementById("chart1").setTheme(theme);
	}

	function dataTipFunc(seriesId, seriesName, index, xName, yName, data, values) {		
	    return "측정일 : " + values[0] + "<br>" + "측정값 : " + values[1] 	    	   
	}
	
</script>
<body class="no-skin real-skin real-popup" id="chartHolder">
<form id="form" name="form" method="post">
	<div class="page-content">
		<div class="page-content-area">
			<div class="page-header">
				<h1>
					<span class="title">시험자료 이력정보</span>
					<span>
						<ul class="breadcrumb">
							<li class="active">정주기시험</li>
							<li class="active">시험자료 이력정보</li>
							<li class="active">트랜드</li>
						</ul>
					</span>
				</h1>			
			</div>
		</div>
	</div>
</form>
</body>

</html>