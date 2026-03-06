<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/pels/include/common.jspf"%>
<%

%>
<script type="text/javascript" src="/resources/assets/js/chart.js"></script>
<script>
	$(document).ready(function () {
		$('#PRCDOC_CFY').val('${PRCDOC_CFY}');
	})
	
	// 폼ID관리 조회
	function fnSearch () {
		let form = document.getElementById('form')
		form.action = "StatsExam_Search.do"
		form.submit()
	}	
</script>
<body class="no-skin real-skin real-popup" id="chartHolder">
<form id="form" name="form" method="post">
	<div class="page-content">
		<div class="page-content-area">
			<div class="page-header">
				<h1>
					<span class="title">정주기시험 통계</span>
					<span>
						<ul class="breadcrumb">
							<li>
								<a href="#">시스템관리</a>
							</li>
							<li class="">통계관리</li>
							<li class="active">정주시시험 통계</li>
						</ul><!-- /.breadcrumb -->
					</span>
				</h1>
			</div><!-- /page-header -
			<div class="row">
				<div class="col-xs-12">
					<!-- PAGE CONTENT BEGINS -->								
					<div class="RealSearchBox">
						<div class="NormalSearch">
							<div class="Default">
								<table border="0" cellpadding="0" cellspacing="0" class="Outline">
									<colgroup>
										<col class="Title" />
										<col style="width:20%" />
										<col class="Title" />
										<col style="width:20%" />
                                                 <col class="Title" />
                                                 <col style="width:20%" />
                                                 <col class="Title" />
                                                 <col style="width:20%" />
                                                 <col class="Title" />
                                                 <col style="width:20%" />
									</colgroup>
									<tr>
										<td class="Title"><span class="Label">구분</span></td>
										<td class="Value">
											<select name="PRCDOC_CFY" id="PRCDOC_CFY">
												<option value="P">정주기시험</option>
												<option value="M">점검지B(DB화)</option>
											</select>
										</td>
									</tr>
								</table>
								<a class="SearchButton" href="javascript:fnSearch();"><span class='Text'>조회</span></a>
							</div>
						</div>
					</div>
					<div class="RealPanel"  style="width:100%; height:50%;">
						<div class="ContentPanel"  >
 							<canvas id="myChart" height="100px;"></canvas>
 						</div>
					</div>
				</div>
		</div>
	</div>
</form>
  <script>
    const ctx = document.getElementById('myChart');
    new Chart(ctx, {
      type: 'bar',
      data: {
    	  labels: [${ChartName}],
        datasets: [{
        	label: '시험횟수',
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