<%--
  오류 출력 페이지
  User: KwangYong
  Date: 26. 5. 11.
--%>
<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%
    Integer statusCode = (Integer) request.getAttribute("statusCode");
    String errorMessage = (String) request.getAttribute("errorMessage");

    if (statusCode == null) {
        statusCode = 500;
    }

    if (errorMessage == null || errorMessage.trim().isEmpty()) {
        errorMessage = "알 수 없는 오류가 발생했습니다.";
    }
%>

<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>Error</title>

    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            width: 100%;
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: #f4f6f8;
            font-family: Arial, sans-serif;
        }

        .error-wrapper {
            text-align: center;
        }

        .status-code {
            font-size: 140px;
            font-weight: 700;
            color: #222;
            line-height: 1;
        }

        .error-message {
            margin-top: 24px;
            font-size: 18px;
            color: #666;
        }
    </style>
</head>
<body>

<div class="error-wrapper">

    <div class="status-code">
        <%= statusCode %>
    </div>

    <div class="error-message">
        <%= errorMessage %>
    </div>

</div>

</body>
</html>