import org.jsoup.Jsoup;
import org.jsoup.helper.Validate;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import java.io.FileOutputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.Writer;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import java.io.IOException;

/**
 * Example program to list links from a URL.
 */
public class parser {
	private static JSONObject cityList = new JSONObject();
	
	public static void main(String[] args) throws IOException {
    	String url = "http://everynoise.com/everyplace.cgi";
        print("Fetching %s...", url);

        Document doc = Jsoup.connect(url).get();
        
        Elements links = doc.select("a[href]");
        
		JSONObject currentCity = new JSONObject();
        JSONArray list = new JSONArray();
       
        int i = 0;
        print("\nLinks: (%d)", links.size());
        for (Element link : links) {
            if(	link.attr("abs:href").contains("embed.spotify.com") || 
            	link.attr("abs:href").contains("everynoise.com/everyplace.cgi?root") ||
            	link.attr("abs:href").contains("everynoise.com/everyplace.cgi?&vector=activity")) {
	            	
	            	if(link.attr("abs:href").contains("embed.spotify.com")) {
	            		currentCity.put("playlistID", link.attr("abs:href").substring(68));
	            		i++;
	            	}
	            	if (link.attr("abs:href").contains("everynoise.com/everyplace.cgi?root")) {
	            		currentCity.put("city", trim(link.text(), 35));
	            		i++;
	            		//print("City: %s", trim(link.text(), 35));
	            	}
	            	if (link.attr("abs:href").contains("everynoise.com/everyplace.cgi?&vector=activity")) {
	            		currentCity.put("country", trim(link.text(), 52));
	            		i++;
	            		
	            	}
	            	
	            	if(i == 3) {
	            		list.add(currentCity);
	            		i = 0;
	            		currentCity = new JSONObject();
	            	}
            }
        }
        
        cityList.put("cities", list);
        
    	try {
    		OutputStream outputStream = new FileOutputStream("test.json");
    		Writer       writer       = new OutputStreamWriter(outputStream, "UTF-8");

    		writer.write(cityList.toJSONString());

    		writer.close();
    		
/*    		FileWriter file = new FileWriter("test.json");
    		OutputStreamWriter stream = new Out
    		file.write(cityList.toJSONString());
    		file.flush();
    		file.close();*/
     
    	} catch (IOException e) {
    		e.printStackTrace();
    	}
 
    }
		
    private static void print(String msg, Object... args) {
        System.out.println(String.format(msg, args));
    }

    private static String trim(String s, int width) {
        if (s.length() > width)
            return s.substring(0, width-1) + ".";
        else
            return s;
    }
}