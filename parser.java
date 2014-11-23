import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import java.io.BufferedReader;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.Writer;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.JSONValue;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.apache.http.client.utils.URIBuilder;
import java.net.URISyntaxException;
import java.net.URL;
import java.net.URLConnection;

public class parser {
	private static JSONObject cityList = new JSONObject();
	private static JSONParser parser = new JSONParser();
	private static String playlistListURL = "http://everynoise.com/everyplace.cgi";
	private static String googleAPIKey = "AIzaSyBbE0GuwRIVc4BAThO8FQZCOMRZ5EvGm0s";
	private static String spotifyToken = "BQBGwnnbHpiGi2NnOS_3Pj-ZVK5BLEDlQJpOSODvlWHG5rvZXAQljqqWTK-6TiMmAJSIGENbgA2w3bLtwpIhx5bW8BjwzNzBfENIMSx4_iGCDYNjqZ3mqXV1EvxVM1rH_EBnju_ZeSLNn2T7znWOU-3Y5KCy";

	public static void main(String[] args) throws IOException, ParseException, URISyntaxException, InterruptedException {
		Document everyPlaceHTML = Jsoup.connect(playlistListURL).get();
		Elements allLinks = everyPlaceHTML.select("a[href]");

		JSONObject currentCity = new JSONObject();
		JSONArray tempCityList = new JSONArray();

		int i = 0;
		int j = 0;
		
		for (Element link : allLinks) {
			// Is this a link that we are interested?
			if(	link.attr("abs:href").contains("embed.spotify.com") || 
					link.attr("abs:href").contains("everynoise.com/everyplace.cgi?root") ||
					link.attr("abs:href").contains("everynoise.com/everyplace.cgi?&vector=activity")) {

				// Does it contain a playlist URI?
				if(link.attr("abs:href").contains("embed.spotify.com")) {
					Thread.sleep(300);
					String playlistID = link.attr("abs:href").substring(68);
					currentCity.put("playlistID", playlistID);
					
					URIBuilder uri = buildURI("https", "api.spotify.com", "/v1/users/glennpmcdonald/playlists/" + playlistID + "/tracks/");
					
			        URL url = new URL(uri.toString());
			        URLConnection uc = url.openConnection();

			        uc.setRequestProperty("Authorization", "Bearer " + spotifyToken);
			        try { InputStreamReader inputStreamReader = new InputStreamReader(uc.getInputStream());
			        
			        StringBuilder b = new StringBuilder();
			        int x;
			         // read till the end of the file
			         while((x = inputStreamReader.read())!=-1)
			         {
			            // int to character
			            char c = (char)x;
			           
			            b.append(c);
			        }
			        x = 0;
			        Object obj2 = parser.parse(b.toString());
			        JSONObject jsonObject = (JSONObject) obj2;
			        JSONArray itemsArr = (JSONArray) jsonObject.get("items");
			        JSONArray playlistIDS = new JSONArray();
			        
			        for (int i1 = 0; i1 < itemsArr.size(); i1++) {			  
			            JSONObject item = (JSONObject) itemsArr.get(i1);
						JSONObject track = (JSONObject) item.get("track");
						Object trackID = track.get("id");
			           
						//print(trackID.toString());
						playlistIDS.add(trackID);
			        }
			        currentCity.put("trackIDS", playlistIDS);
			        } catch (Exception iOException){
			        	print("Fuck..");
			        }
			        
			    
					
			        i++;
				}

				// Does it contain a city name?
				if (link.attr("abs:href").contains("everynoise.com/everyplace.cgi?root")) {
					Thread.sleep(300);
					
					URIBuilder uri = buildURI("https", "maps.googleapis.com", "/maps/api/geocode/json");
					uri.setParameter("address", link.text());
					uri.setParameter("key", googleAPIKey);
					
					URL url = new URL(uri.toString());
					BufferedReader in = new BufferedReader(new InputStreamReader(url.openStream()));

					StringBuffer buffer = new StringBuffer();
					String inputLine;
					while ((inputLine = in.readLine()) != null)
						buffer.append(inputLine);
					in.close();

					JSONValue.parse(buffer.toString());

					Object obj = parser.parse(buffer.toString());
					
					JSONObject jsonObject = (JSONObject) obj;
					JSONArray resultArr = (JSONArray) jsonObject.get("results");
					JSONObject resultObject = (JSONObject) resultArr.get(0);
					JSONObject resultGeometry = (JSONObject) resultObject.get("geometry");
					JSONObject resultLocation = (JSONObject) resultGeometry.get("location");
					
					currentCity.put("city", link.text());
					currentCity.put("latitude", resultLocation.get("lat").toString());
					currentCity.put("longitude", resultLocation.get("lng").toString());
					i++;
				}

				// Does it contain a country?
				if (link.attr("abs:href").contains("everynoise.com/everyplace.cgi?&vector=activity")) {
					currentCity.put("country", trim(link.text(), 52));
					i++;

				}

				if(i == 3) {
					tempCityList.add(currentCity);
					print("Add: " + currentCity.toString());
					i = 0;
					currentCity = new JSONObject();
				}
			}
		}

		cityList.put("cities", tempCityList);

		writeToFile("test.json", cityList.toJSONString());
	}

	private static URIBuilder buildURI(String scheme, String host, String path) {
		URIBuilder uri = new URIBuilder();
		uri.setScheme(scheme);
		uri.setHost(host);
		uri.setPath(path);
		return uri;
	}

	private static void writeToFile(String fileName, String data) {
		try {
			OutputStream outputStream = new FileOutputStream(fileName);
			Writer writer = new OutputStreamWriter(outputStream, "UTF-8");
			writer.write(data);
			writer.close();
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