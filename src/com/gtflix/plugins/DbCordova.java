package com.gtflix.plugins;

import org.apache.cordova.api.CallbackContext;
import org.apache.cordova.api.CordovaPlugin;
import org.json.JSONArray;
import org.json.JSONException;

import com.gtflix.Nepotom;
import com.gtflix.helpers.Db;

public class DbCordova extends CordovaPlugin{
	public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
		 
		if(action.equals("removeAllRecentMessages")){
	    	removeAllRecentMessages(callbackContext);
	    	return true;
	    }
	    else
	    	return false;
	  }
	
	private void removeAllRecentMessages(CallbackContext callbackContext){
		Db db = new Db( Nepotom.getAppContext() );
		db.removeAllRecentMessages();
		callbackContext.success();
	}
}
