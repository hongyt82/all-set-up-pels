/**
 * NxSsoClient
 * @author RaonSecure
 * @date 2021.05.25
 */

var NxSsoClient = (function() { // NameSapce 만들기
	var that = {} ;				// 외부에 보낼 객체
	
	that.date = "2021.05.25 16:08";
	
	var clientProtocol = "khnp.sso.ssoclient" ; // Do not modify

	var ssoBridgeAddress = "https://10.151.11.120/khnp/ssoBridge.jsp";
	var ssoBridgePort = "443";
	var secureChannel = "true"; //ssoBridge와의 SSL 통신 여부 설정

	var localWebServerPort = "17007";
	var localWebServer = "http://127.0.0.1:" + localWebServerPort;
	
	var isLog = true ;

	/**
	 * CheckInstall WAClientModule 인스톨 여부 체크
	 * @param 
     * @return 
	 */
	function CheckInstall()
	{
		var requestUrl = localWebServer + "/echo";
		var params = "echo";

		return $.ajax
		({
			url: requestUrl,
			//timeout: 300,
			success:function(resultSet) {
				if(isLog) console.log('[CheckInstall] success (already installed)');
			},
			error:function(resultSet) {
				if(isLog) console.log('[CheckInstall] error (statusText:' + resultSet.statusText + ')');
			},
		});
	}
	that.CheckInstall = CheckInstall;	

	/**
	 * LaunchLocalWebServer Custom Uri Scheme 방식으로 WAClientCommand를 호출하며,
					WAClientCommand는 WAClientNx를 실행하여 로컬웹서버를 기동시킵니다.
	 * @param 로컬웹서버 포트
     * @return 
	 */
	function LaunchLocalWebServer(port)
	{
      localWebServerPort = port;
      document.location = clientProtocol + ":-launch_lws?localport=" + port;
	}
	that.LaunchLocalWebServer = LaunchLocalWebServer;	

	/**
	 * GetVersion WAClientModule의 버전을 반환
	 * @param 
     * @return 
	 */
	function GetVersion()
	{
		var requestUrl = localWebServer + "/getVersion";
		var params = "";

		console.log(requestUrl);
		
		return $.ajax
		({
			url: requestUrl,
			dataType: "jsonp",
			async: false,
			jsonp: "callback"
		});
	}
	that.GetVersion = GetVersion;		// 외부로 함수 노출하기
	
	/**
	 * RunApp 임의의 프로그램 실행
	 * @param
	 *   - path 실행 프로그램 절대 경로
	 *   - argument 프로그램 실행 시 파라미터
	 *   - currdir 프로그램 실행 경로
	 */
	function RunApp(path, argument, currdir)
	{
		var requestUrl = localWebServer + "/runApp";
		var params = "path=" + path + "^argument=" + argument + "^currdir=" + currdir;
		var paramsBase64 = Base64.encode(params);
		
		console.log('\n[runApp]');
		
		return $.ajax
		({
			url: requestUrl,
			dataType: "jsonp",
			async: false,
			jsonp: "callback",
			data: { params:paramsBase64 },
			
			success:function(resultSet) {
				resultMessage = resultSet.json.code;
				console.log('[runApp] success (result:' + resultMessage + ')');
			},
			error:function(resultSet) {
				console.log('[runApp] error (responseText:' + resultSet.responseText + ')');
			}
			
		});
	}
	that.RunApp = RunApp;		// 외부로 함수 노출하기
	
	/**
	 * SetConf 환경 설정
	 * @param loginUrl {string} : Tray Icon 에서 Login 시 기본브라우저로 Open할 LoginURL
	 * @return 
	 */
	function SetConf(loginUrl) 
	{
		var requestUrl = localWebServer + "/setConf";
		var params = "serveraddress=" + ssoBridgeAddress + "^"
						 + "serverport=" + ssoBridgePort + "^"
						 + "securechannel=" + secureChannel + "^"
						 + "loginurl=" + loginUrl;

		var paramsBase64 = Base64.encode(params);

		return $.ajax
		({
			url: requestUrl,
			dataType: "jsonp",
			async: false,
			jsonp: "callback",
			data: { params:paramsBase64 },
			
			success:function(resultSet) {
				resultMessage = resultSet.json.code;
				if(isLog) console.log('[SetConf] success (result:' + resultMessage + ')');
			},
			error:function(resultSet) {
				if(isLog) console.log('[SetConf] error (responseText:' + resultSet.responseText + ')');
			},
			fail:function(resultSet) {
				if(isLog) console.log('[SetConf] fail (statusText:' + resultSet.statusText + ')');
			}
		});
	}
	that.SetConf = SetConf;		// 외부로 함수 노출하기

	/**
	 * GetMAC 사용자 PC의 맥 주소 가져오기
	 * @param 
	 * @return 
	 */
	function GetMAC() 
	{
		var requestUrl = localWebServer + "/getMacaddress";
		var params = "";

		return $.ajax
		({
			url: requestUrl,
			dataType: "jsonp",
			async: false,
			jsonp: "callback",
			success:function(resultSet) {
				resultMessage = resultSet.json.message;
				if(isLog) console.log('[GetMAC] success (version:' + resultMessage + ')');
			},
			error:function(resultSet) {
				if(isLog) console.log('[GetMAC] error (statusText:' + resultSet.statusText + ')');
			},
			fail:function(resultSet) {
				if(isLog) console.log('[GetMAC] fail (statusText:' + resultSet.statusText + ')');
			}
		});
	}
	that.GetMAC = GetMAC;		// 외부로 함수 노출하기

	/**
	 * SetToken 인증토큰 저장 후에 인증토큰을 검증합니다.
	 * 			SetToken 하기 전에는 SetConf를 통하여 설정을 진행하여야 합니다.
	 *				설정이 진행되어야만 Bridge에 접속하여 인증토큰 검증에 성공해야지만
	 *				TrayIcon의 Tooltip 메세지와 아이콘이 변경됩니다.
	 * @param ssotoken {string} : 사용자의 인증토큰
	 * @return 인증토큰 저장 자체에 대한 결과를 반환합니다.
	 *			  인증토큰 검증에 대한 결과를 반환하지 않습니다.
	 */
	function SetToken(ssotoken)
	{
		var requestUrl = localWebServer + "/setToken";
		var params = "token=" + ssotoken;
		
		var paramsBase64 = Base64.encode(params);
		console.log(paramsBase64);
		
		return $.ajax
		({
			url: requestUrl,
			dataType: "jsonp",
			async: false,
			jsonp: "callback",
			data: { params:paramsBase64 },
			
			success:function(resultSet) {
				resultMessage = resultSet.json.code;
				if(isLog) console.log('[SetToken] success (result:' + resultMessage + ')');
			},
			error:function(resultSet) {
				if(isLog) console.log('[SetToken] error (responseText:' + resultSet.responseText + ')');
			},
			fail:function(resultSet) {
				if(isLog) console.log('[SetToken] fail (statusText:' + resultSet.statusText + ')');
			}			
		});
	}
	that.SetToken = SetToken;		// 외부로 함수 노출하기

	/**
	 * GetToken 인증토큰을 반환
	 * @param 
	 * @return 
	 */
	function GetToken()
	{
		var requestUrl = localWebServer + "/getToken";
		var params = "";
		
		return $.ajax
		({
			url: requestUrl,
			dataType: "jsonp",
			async: false,
			jsonp: "callback",
			
			success:function(resultSet) {
				resultMessage = resultSet.json.code;
				if(isLog) console.log('[GetToken] success (result:' + resultMessage + ')');
			},
			error:function(resultSet) {
				if(isLog) console.log('[GetToken] error (responseText:' + resultSet.responseText + ')');
			},
			fail:function(resultSet) {
				if(isLog) console.log('[GetToken] fail (statusText:' + resultSet.statusText + ')');
			}			
		});
	}
	that.GetToken = GetToken;		// 외부로 함수 노출하기
	
	function RegUserSession(userId, clientIp, overwrite)
	{
		var requestUrl = localWebServer + "/regUserSession";
		var params = "userid=" + userId + "^"
					+ "clientip=" + clientIp + "^"
					+ "overwrite=" + overwrite;

		var paramsBase64 = Base64.encode(params);
		
		return $.ajax
		({
			url: requestUrl,
			dataType: "jsonp",
			async: false,
			jsonp: "callback",
			data: { params:paramsBase64 },
			
			success:function(resultSet) {
				resultMessage = resultSet.json.code;
				if(isLog) console.log('[RegUserSession] success (result:' + resultMessage + ')');
			},
			error:function(resultSet) {
				if(isLog) console.log('[RegUserSession] error (responseText:' + resultSet.responseText + ')');
			},
			fail:function(resultSet) {
				if(isLog) console.log('[RegUserSession] fail (statusText:' + resultSet.statusText + ')');
			}			
		});
	}
	that.RegUserSession = RegUserSession;
	
	/**
	 * 
	 */
	function AuthId(userId, userPassword, clientIp, overwrite)
	{
		var requestUrl = localWebServer + "/authId";
		var params = "userid=" + userId + "^"
					+ "userpwd=" + userPassword + "^"
					+ "clientip=" + clientIp + "^"
					+ "overwrite=" + overwrite;

		var paramsBase64 = Base64.encode(params);
		
		return $.ajax
		({
			url: requestUrl,
			dataType: "jsonp",
			async: false,
			jsonp: "callback",
			data: { params:paramsBase64 },
			
			success:function(resultSet) {
				resultMessage = resultSet.json.code;
				if(isLog) console.log('[AuthId] success (result:' + resultMessage + ')');
			},
			error:function(resultSet) {
				if(isLog) console.log('[AuthId] error (responseText:' + resultSet.responseText + ')');
			},
			fail:function(resultSet) {
				if(isLog) console.log('[AuthId] fail (statusText:' + resultSet.statusText + ')');
			}			
		});
	}
	that.AuthId = AuthId;
	

	/**
	 * AuthOut 인증토큰을 반환
	 * @param 
	 * @return 
	 */
	function AuthOut()
	{
		var requestUrl = localWebServer + "/authOut";
		var params = "";
		
		return $.ajax
		({
			url: requestUrl,
			dataType: "jsonp",
			async: false,
			jsonp: "callback",
			
			success:function(resultSet) {
				resultMessage = resultSet.json.code;
				if(isLog) console.log('[AuthOut] success (result:' + resultMessage + ')');
			},
			error:function(resultSet) {
				if(isLog) console.log('[AuthOut] error (responseText:' + resultSet.responseText + ')');
			},
			fail:function(resultSet) {
				if(isLog) console.log('[AuthOut] fail (statusText:' + resultSet.statusText + ')');
			}			
		});
	}
	that.AuthOut = AuthOut;		// 외부로 함수 노출하기

	return that ; // 객체 내보내기
}()); // 해당 함수 실행하기

/**
*
*  Base64 encode / decode
*  http://www.webtoolkit.info/
*
**/
var Base64 = {
	// private property
	_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

	// public method for encoding
	encode : function (input) {
		var output = "";
		var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
		var i = 0;

		input = Base64._utf8_encode(input);

		while (i < input.length) {

			chr1 = input.charCodeAt(i++);
			chr2 = input.charCodeAt(i++);
			chr3 = input.charCodeAt(i++);

			enc1 = chr1 >> 2;
			enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
			enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
			enc4 = chr3 & 63;

			if (isNaN(chr2)) {
				enc3 = enc4 = 64;
			} else if (isNaN(chr3)) {
				enc4 = 64;
			}

			output = output +
			this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
			this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
		}

		return output;
	},

	// public method for decoding
	decode : function (input) {
		var output = "";
		var chr1, chr2, chr3;
		var enc1, enc2, enc3, enc4;
		var i = 0;

		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

		while (i < input.length) {

			enc1 = this._keyStr.indexOf(input.charAt(i++));
			enc2 = this._keyStr.indexOf(input.charAt(i++));
			enc3 = this._keyStr.indexOf(input.charAt(i++));
			enc4 = this._keyStr.indexOf(input.charAt(i++));

			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;

			output = output + String.fromCharCode(chr1);

			if (enc3 != 64) {
				output = output + String.fromCharCode(chr2);
			}
			if (enc4 != 64) {
				output = output + String.fromCharCode(chr3);
			}
		}

		output = Base64._utf8_decode(output);
		return output;
	},

	// private method for UTF-8 encoding
	_utf8_encode : function (string) {
		string = string.replace(/\r\n/g,"\n");
		var utftext = "";

		for (var n = 0; n < string.length; n++) {

			var c = string.charCodeAt(n);

			if (c < 128) {
				utftext += String.fromCharCode(c);
			}
			else if((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			}
			else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}
		}

		return utftext;
	},

	// private method for UTF-8 decoding
	_utf8_decode : function (utftext) {
		var string = "";
		var i = 0;
		var c = c1 = c2 = 0;

		while ( i < utftext.length ) {

			c = utftext.charCodeAt(i);

			if (c < 128) {
				string += String.fromCharCode(c);
				i++;
			}
			else if((c > 191) && (c < 224)) {
				c2 = utftext.charCodeAt(i+1);
				string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
				i += 2;
			}
			else {
				c2 = utftext.charCodeAt(i+1);
				c3 = utftext.charCodeAt(i+2);
				string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
				i += 3;
			}
		}

		return string;
	}
}