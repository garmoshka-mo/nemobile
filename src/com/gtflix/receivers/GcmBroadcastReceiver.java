package com.gtflix.receivers;
import android.app.Activity;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.support.v4.content.WakefulBroadcastReceiver;
import com.gtflix.services.GcmIntentService;


import android.content.SharedPreferences;
import android.util.Log;

public class GcmBroadcastReceiver extends WakefulBroadcastReceiver {
	
	static public SharedPreferences prefs;
	
    @Override
    public void onReceive(Context context, Intent intent) {
    	Log.i(">>>>", "IN IN IN");
    	
        // Explicitly specify that GcmIntentService will handle the intent.
        ComponentName comp = new ComponentName(context.getPackageName(),
                GcmIntentService.class.getName());
        // Start the service, keeping the device awake while it is launching.
        startWakefulService(context, (intent.setComponent(comp)));
        setResultCode(Activity.RESULT_OK);
    }

}