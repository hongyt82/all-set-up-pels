<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/pels/include/common.jspf"%>
	<script>
		function fnSearch() {
			let form = document.getElementById('form')
			form.action = "Month_Search.do"
			form.submit()			
		}
	</script>
	<style>
		/* Calendar */
		.Calendar {width: 100%; border-collapse: collapse; float: left;}
		.Calendar a {display: block; text-decoration: none;}
		
		.Calendar th, .Calendar td {border: 1px solid #ccc; padding: 8px;}
		.Calendar th {background-color: #f2f2f2; font-size: 16px; line-height: 26px !important;}
		.Calendar td {cursor: pointer; height: 125px; position:relative;}
		.Calendar td.Today {font-weight: 800; border-width: 2px; background-color: rgba(0, 137, 167, 0.3);}
		.Calendar td.DatePasses p:nth-child(n):not(:first-child) {text-decoration: line-through; background-color: transparent !important;}
		.Calendar td p {font-size: 12px; line-height: 18px !important; margin: 3px 0 !important;}
		.Calendar td p:first-child {font-size: 16px; line-height: 20px !important; position: absolute; right:5px; top:5px; color: #fff;}
		.Calendar td p:nth-child(2) {margin-top: 25px !important;}
		
		/* 달력 일정 백그라운드 색상 */
		/*
		.Calendar td p:nth-child(2) {background-color: black;}
		.Calendar td p:nth-child(3) {background-color: green;}
		.Calendar td p:nth-child(4) {background-color: deepskyblue;}
		.Calendar td p:nth-child(5) {background-color: blue;}
		.Calendar td p:nth-child(6) {background-color: red;}
		*/
		
		/* 연결된 일정 */
		.Calendar td p.Datechain {width: calc(100% + 16px); position: relative; left: -8px;}
		
		.Calendar td p:nth-child(odd) {color:#000;}
		.Calendar td p:nth-child(even) {color:#000;}
		
		.Calendar td span {margin: 0; padding: 0;}
		.Calendar td span.purple {color:#7030a0;}
		.Calendar td span.blue {color:#0000ff;}
		.Calendar td span.red {color:#ff0000;}
		.Calendar td span.pink {color:#ff94ff;}
		.Calendar td span.brown {color:#993300;}
		.Calendar td span.yellowgreen {color:#32bf72;}
	</style>
	<body class="no-skin real-skin themes-skin">
		<form id="form" name="form" method="post">
			<input name="YearMonth" id="YearMonth" type="hidden" value="">
			<div class="main-content">
				<div class="page-content">
					<div class="page-content-area">
						<!-- #ection:basics/page-header -->
						<div class="page-header">
							<h1>
								<span class="title">월별 정주기시험 계획표</span>
								<span>
									<ul class="breadcrumb">
										<li>
											<a href="#">일정관리</a>
										</li>
	                                    <li class="active">월별 정주기시험 계획표</li>
									</ul><!-- /.breadcrumb -->
								</span>
							</h1>
						</div><!-- /page-header -->
						<div class="PageButtonGroup" style="text-align:right">
							<a class="btn-m" href="javascript:fnSearch();"><span class="Text">현황 보기</span></a>
						</div>
						
						<!-- #section:basics/page-button -->
						<div class="row">
							<div class="col-xs-12">
								<!-- PAGE CONTENT BEGINS -->
                                <div class="RealPanel">
                                    <div class="ContentPanel">
                                        <div class="Grid">
                                            <div id="calendar">
											</div>
                                        </div>
                                    </div>
                                </div>
								<!-- PAGE CONTENT ENDS -->
							</div><!-- /.col -->
						</div><!-- /.row -->
					</div><!-- /.page-content-area -->
				</div><!-- /.page-content -->
			</div><!-- /.main-content -->	
        <script>
            // 달력 만드는 코드
            // 로컬 시간을 사용한 코드입니다. 적용 시 서버 시간으로 바꿔주세요.
            const calendarContainer = document.getElementById('calendar');
            const currentDate = new Date();
            let currentYear = currentDate.getFullYear();
            let currentMonth = currentDate.getMonth();

            var calendar_h = "";
            
            function createCalendar(year, month) {
                const daysInMonth = new Date(year, month + 1, 0).getDate();
                const firstDay = new Date(year, month, 1).getDay();
                const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

                let table = '<table class="Calendar"><colgroup><col width="14%" /><col width="14%" /><col width="14%" /><col width="14%" /><col width="14%" /><col width="14%" /><col width="14%" /></colgroup><thead><tr><th><div class="prev-btn" onclick="prevMonth()"><a>&lt; 이전달</a></div></th><th colspan="5">' + year + '년 ' + monthNames[month] + '<a href="" class="option_btn"></a></th><th><div class="next-btn" onclick="nextMonth()"><a>다음달 &gt;</a></div></th></tr>';
                table += '<tr><th style="background-color: #ff033e;">Sun</th><th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th><th>Sat</th></tr></thead><tbody>';

                let date = 1;
                for (let i = 0; i < 6; i++) {
                    let row = '<tr>';
                    let hasDates = false; // 각 행에 날짜가 있는지 여부를 나타내는 변수입니다.

                    for (let j = 0; j < 7; j++) {
                        if (i === 0 && j < firstDay) {
                            row += '<td></td>';
                        } else if (date > daysInMonth) {
                            row += '<td></td>';
                        } else {
                            let tdClass = '';

                            const currentDateStr = currentDate.getFullYear() +
                                                    ('0' + (currentDate.getMonth() + 1)).slice(-2) +
                                                    ('0' + currentDate.getDate()).slice(-2);

                            const currentDateCheck = year * 10000 + (month + 1) * 100 + date; // 자료형인 날짜 정보를 문자열로 변환하고 자릿수를 추가해서 YYYYMMDD 형식으로 만듭니다.

                            if (currentDateCheck === parseInt(currentDateStr)) {
                                tdClass = 'Today'; //오늘 날짜에 bg색상 바뀌는 class를 추가합니다.
                            } else if (currentDateCheck < parseInt(currentDateStr)) {
                                //tdClass = 'DatePasses'; //오늘 이전의 날짜에 취소선 그어주는 class를 추가합니다.
                            }
                            row += '<td id="td' + date + '" class="' + tdClass + '" onclick="showSchedule(' + date + ',' + (month + 1) + ',' + year + ')">';
                            row += '</td>';
                            date++;
                            hasDates = true;
                        }
                    }

                    // 날짜가 있는 행만 추가합니다.
                    row += '</tr>';
                    if (hasDates) {
                        table += row;
                    } else {
                        break;
                    }
                }

                table += '</tr></tbody></table>';
                calendarContainer.innerHTML = table;

		        var YearMonth;
                if(month < 10) {
                    YearMonth = year + "-0" + (month + 1);
                }
                else  {
                    YearMonth = year + "-" + (month + 1);
                }
                
                GetSchedule(YearMonth);
            }


            function prevMonth() {
                currentMonth--;
                if (currentMonth < 0) {
                    currentMonth = 11;
                    currentYear--;
                }
                createCalendar(currentYear, currentMonth);
            }

            function nextMonth() {
                currentMonth++;
                if (currentMonth > 11) {
                    currentMonth = 0;
                    currentYear++;
                }
                createCalendar(currentYear, currentMonth);
            }
            
            function GetSchedule(YearMonth) {
                document.form.YearMonth.value = YearMonth;
                var formData = new FormData(document.getElementById("form"));
                $.ajax({
                    type: 'POST',
                    url: 'Get_Calendar_Ajax.do',
                    data: formData,
                    processData: false,
                    dataType: 'JSON',
    				contentType: "application/x-www-form-urlencoded; charset=utf-8",
                    success: function (resultData) {
    					const monthList = resultData.monthList
                        for (var i = 0; i < monthList.length; i++) {
                            if (document.getElementById("td" + (i+1)) != null) {
                            	const TH1_ITM_NM = monthList[i].TH1_ITM_NM;
                            	const TH2_ITM_NM = monthList[i].TH2_ITM_NM;
                            	const TH3_ITM_NM = monthList[i].TH3_ITM_NM;
                            	const TH4_ITM_NM = monthList[i].TH4_ITM_NM;
                            	
                                var data1 = "<p>" + (i+1).toString() + "</p>";
                                if(TH1_ITM_NM != null) 	data1 += "<p>N: " + TH1_ITM_NM + "</p>";
                                if(TH2_ITM_NM != null) 	data1 += "<p>D: " + TH2_ITM_NM + "</p>";
                                if(TH3_ITM_NM != null) 	data1 += "<p>A: " + TH3_ITM_NM + "</p>";
                                if(TH4_ITM_NM != null) 	data1 += "<p>H: " + TH4_ITM_NM + "</p>";
                                
                                document.getElementById("td" + (i+1)).innerHTML = data1;
                            }
                        }
                    }, error: function (request, status, error) {
                        console.log('에러발생 ::' + error + ', status:: ' + status + ', code::' + request.status);
                    }
                });
            }

            
            createCalendar(currentYear, currentMonth);
            </script>
			
		</form>
	</body>
</html>