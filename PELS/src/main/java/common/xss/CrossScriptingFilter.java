package common.xss;

import java.io.IOException;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;

import org.apache.poi.hssf.record.MulBlankRecord;
 
public class CrossScriptingFilter implements Filter {
 
	private String encoding;
    protected FilterConfig filterConfig;
    
    public void init(FilterConfig filterConfig) throws ServletException {
    	this.filterConfig = filterConfig;
    	/** xml 에서 설정한 encoding 값이 된다 */
        this.encoding = filterConfig.getInitParameter("encoding");
    }
 
    public void destroy() {
    	this.encoding = null;
        this.filterConfig = null;
    }
 
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
        throws IOException, ServletException {
 
    	if (request.getCharacterEncoding() == null){
            if (encoding != null){
                request.setCharacterEncoding(encoding);
            }
        }
    	
    	//url 예외처리 
    	//String url = ((HttpServletRequest)request).getRequestURI();
    	
		chain.doFilter(new RequestWrapper((HttpServletRequest) request), response);
    }
    
    public FilterConfig getFilterConfig(){
        return filterConfig;
    }
     
    public void setFilterConfig(FilterConfig cfg){
        filterConfig = cfg;
    }
}
