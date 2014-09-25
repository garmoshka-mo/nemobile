package com.gtflix.services;


import com.google.android.gms.gcm.GoogleCloudMessaging;
import android.app.AlarmManager;
//import android.app.AlarmManager;
import android.app.IntentService;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Bundle;
import android.os.SystemClock;
import android.support.v4.app.NotificationCompat;
import android.util.Log;

import com.gtflix.helpers.Db;
import com.gtflix.receivers.GcmBroadcastReceiver;
import com.gtflix.Nepotom;

import org.json.JSONException;

import com.gtflix.R;

public class GcmIntentService extends IntentService {
    public static final int NOTIFICATION_ID = 1;
    private static final String TAG = "PubnubGcm";
    private NotificationManager mNotificationManager;
    private NotificationCompat.Builder notificationBuilder;

    public GcmIntentService() {
        super("GcmIntentService");
    }

    @Override
    protected void onHandleIntent(Intent intent) {
    	Log.i(">>>>", "HANDLING INTENT");
        Bundle extras = intent.getExtras();
             
        GoogleCloudMessaging gcm = GoogleCloudMessaging.getInstance(this);

        String messageType = gcm.getMessageType(intent);

        if (!extras.isEmpty()) {
        	
        	try {

	            if (GoogleCloudMessaging. MESSAGE_TYPE_SEND_ERROR.equals(messageType)) {
	            	
					sendNotification(extras);
	
	            } else if (GoogleCloudMessaging.MESSAGE_TYPE_DELETED.equals(messageType)) {
	            	
					sendNotification(extras);
						
	            } else if (GoogleCloudMessaging.MESSAGE_TYPE_MESSAGE.equals(messageType)) {
	            	
	                Log.i(TAG, "Completed work @ " + SystemClock.elapsedRealtime());
					sendNotification(extras);
	                Log.i(TAG, "Received: " + extras.toString());
	            }
            
        	} catch (JSONException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();       
        	}
        }
        // Release the wake lock provided by the WakefulBroadcastReceiver.
        GcmBroadcastReceiver.completeWakefulIntent(intent);
    }


    private void sendNotification(Bundle extras) throws JSONException {  	
    	Db db = new Db(this);
    	mNotificationManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
    	long sentTime = Long.valueOf( extras.getString("sentTime") );
    	int timeToExist = Integer.valueOf( extras.getString("timeToExist") );
    	String friendName = extras.getString("fffrom");
    	String message = extras.getString("message");
    	
    	SharedPreferences prefs = getSharedPreferences("SQL", Context.MODE_PRIVATE);
		if( !prefs.getBoolean("isRecentMessagesExists", false) ){
			db.createRecentMessagesTable();
		}
		
		
		db.addEntryToRecentMessages(sentTime, sentTime + timeToExist, friendName, message);
		String text = db.getRecentMessage(8);
		
		
    	/* SHOWING MESSAGE */
        Intent mainActivityIntent = new Intent(this, Nepotom.class);
        PendingIntent contentIntent = PendingIntent.getActivity(this, 0, mainActivityIntent , 0);

        notificationBuilder = new NotificationCompat.Builder(this)
        .setSmallIcon(R.drawable.icon)
        .setContentTitle("Непотом!")
        .setStyle(new NotificationCompat.BigTextStyle()
        .bigText(text))
        .setContentText(text)
        .setAutoCancel(true);

        notificationBuilder.setContentIntent(contentIntent);
        mNotificationManager.notify(NOTIFICATION_ID, notificationBuilder.build());
    	
        /* CREATING ALARM TO REMOVE MESSAGE */
    	Intent testIntentServiceIntent = new Intent();
    	testIntentServiceIntent.setClassName(getPackageName(), TestIntentService.class.getName());
    	
    	String uri = "http://gtflix.com?name=" + friendName + "&sentTime=" + String.valueOf(sentTime);
    	testIntentServiceIntent.setData( Uri.parse(uri) );
    	testIntentServiceIntent.putExtra("notificationId", NOTIFICATION_ID);
    	PendingIntent pi = PendingIntent.getService(this, 0, testIntentServiceIntent, 0);
    	
    	AlarmManager am = (AlarmManager) getSystemService(Context.ALARM_SERVICE);
    	am.cancel(pi);
    	
    	am.set( AlarmManager.RTC_WAKEUP, sentTime + timeToExist, pi );
        

    }
}