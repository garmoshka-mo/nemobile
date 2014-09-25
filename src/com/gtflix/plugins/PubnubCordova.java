package com.gtflix.plugins;

import java.io.IOException;

import org.apache.cordova.api.CallbackContext;
import org.apache.cordova.api.CordovaPlugin;
import org.json.JSONArray;
import org.json.JSONException;

import com.google.android.gms.gcm.GoogleCloudMessaging;
import com.gtflix.Nepotom;
import com.pubnub.api.Pubnub;



import android.content.Context;
import android.content.SharedPreferences;

import android.os.AsyncTask;

import android.text.TextUtils;
import android.util.Log;


public class PubnubCordova extends CordovaPlugin{
	public static Pubnub pubnub;
	public static GoogleCloudMessaging gcm;
	public static SharedPreferences prefs;
	public static Context context;
    
    public static String SENDER_ID;
    public static String REG_ID;
		
    static String PUBLISH_KEY = "demo";
    static String SUBSCRIBE_KEY = "demo";
    static String CIPHER_KEY = "";
    static String SECRET_KEY = "demo";
    static String ORIGIN = "pubsub";
    static String AUTH_KEY;
    static String UUID;
    static Boolean SSL = false;
    static String method = "";
    static CallbackContext callback;
	
	

  public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
	 method = action;
	 callback = callbackContext;
	  
	if(pubnub == null) pubnub = pubnubInit();
	 
	if(action.equals("getRegId")){
    	this.getRegId();
    	return false;
    }
    else
    return false;
  }
  
  private static Pubnub pubnubInit() {
	  /*
      PUBLISH_KEY = "pub-c-4bb43f7b-a7b1-468e-822a-6cb7821a0670";
      SUBSCRIBE_KEY = "sub-c-c3e80846-2eaa-11e4-b3c3-02ee2ddab7fe";
      */
	  PUBLISH_KEY = "demo-36";
	  SUBSCRIBE_KEY = "demo-36";
	  SECRET_KEY = "demo-36";
      ORIGIN = "gcm-beta";
      SENDER_ID = "506053237730";//"112956072550";
      context = Nepotom.getAppContext();
      gcm = GoogleCloudMessaging.getInstance(context);
      prefs = context.getSharedPreferences("PUBNUB_DEV_CONSOLE", Context.MODE_PRIVATE);
      REG_ID = gcmRegister();

      pubnub = new Pubnub(
              PUBLISH_KEY,
              SUBSCRIBE_KEY,
              SECRET_KEY
      );
      pubnub.setCacheBusting(false);
      pubnub.setOrigin(ORIGIN);
      return pubnub;
  }
  
/* STEPS FOR OBTAINING REGISTRATION ID */
  public static String gcmRegister() {
      REG_ID = getRegistrationId(context);
      if (TextUtils.isEmpty(REG_ID)) registerInBackground();
      return REG_ID;
  }
  
  private void getRegId(){
	  if(pubnub == null) pubnub = pubnubInit();
	  callback.success( REG_ID );
  }
  
  public static String getRegIdStatic(){
	  if(pubnub == null) pubnub = pubnubInit();
	  return REG_ID;
  }

  private static String getRegistrationId(Context context) {
      String registrationId = prefs.getString("REG_ID", "");
      if (registrationId.length() <= 0) return "";
      return registrationId;
  }
  
  private static void storeRegistrationId(String regId) {
      SharedPreferences.Editor editor = prefs.edit();
      editor.putString("REG_ID", regId);
      editor.commit();
  }
  
  private static void registerInBackground() {
      new AsyncTask<Void, Void, String>() {
          @Override
          protected String doInBackground(Void... params) {
              String msg = "";
              try {
            	  Log.i(">>>>", "registrate");
                  REG_ID = gcm.register(SENDER_ID);                                
                  storeRegistrationId(REG_ID);
                  Log.i(">>>>", REG_ID);
              } catch (IOException ex) {
              }
              return msg;
          }
          @Override
          protected void onPostExecute(String msg) {
        	  if(method.equals("registrateInGcm"))
        		  callback.success("reregisteringDone");
          }
      }.execute(null, null, null);
  }
  
}
