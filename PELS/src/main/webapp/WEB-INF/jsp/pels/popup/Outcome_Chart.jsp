<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/pels/include/common.jspf"%>
<%

%>
<script type="text/javascript" src="/resources/assets/js/chart.js"></script>
<body class="no-skin real-skin real-popup" id="chartHolder">
<form id="form" name="form" method="post">
	<div class="page-content">
		<div class="page-content-area">
			<div class="page-header">
				<h1>
					<span class="title">시험자료 이력정보</span>
					<span>
						<div>
    						<canvas id="myChart"></canvas>
  						</div>
					</span>
				</h1>			
			</div>
		</div>
	</div>
</form>
  <script>
  	let outcomeChartList = '${jsonArray}';
    const ctx = document.getElementById('myChart');
    let aa = '12, 19, 3, 5, 2, 3';
    new Chart(ctx, {
      type: 'line',
      data: {
        datasets: [{
          label: '${TITL_NM} : ${TH1_ITM_NM} ${TH2_ITM_NM} ${TH3_ITM_NM}',
          data: [${ChartVal}],
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  </script>
</body>

</html>