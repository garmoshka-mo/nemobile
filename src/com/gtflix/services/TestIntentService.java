package com.gtflix.services;


import com.gtflix.R;

import android.annotation.SuppressLint;
import android.app.AlarmManager;
import android.app.IntentService;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.database.Cursor;
import android.net.Uri;
import android.support.v4.app.NotificationCompat;
//import android.util.Log;

import com.gtflix.helpers.Db;
import com.gtflix.receivers.StartMyServiceAtBootReceiver;
import com.gtflix.Nepotom;

public class TestIntentService extends IntentService {
		
	public TestIntentService() {
        super("TestIntentService");
    }

    @SuppressLint("NewApi") @Override
    protected void onHandleIntent(Intent intent) {
    	Db db = new Db(this);
		NotificationManager mNotificationManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
		NotificationCompat.Builder mBuilder = new NotificationCompat.Builder(this);
		SharedPreferences prefs = getSharedPreferences("SQL", Context.MODE_PRIVATE);
		
		Uri u = intent.getData();
		if(u != null){
			db.removeRecentMessage( Long.valueOf(u.getQueryParameter("sentTime")) , u.getQueryParameter("name"));
		}else{
			db.removeAllOldMessages( System.currentTimeMillis() );
			setNewAlarms(db);
		}
		
		
		
		
		
		if( !prefs.getBoolean("isRecentMessagesExists", false) ){	
			db.createRecentMessagesTable();
		}
        
		String text = db.getRecentMessage(8);
			
		if( text.isEmpty() ){
			
			mNotificationManager.cancel(1);
			StartMyServiceAtBootReceiver.completeWakefulIntent(intent);
			
		}else{
			
			PendingIntent contentIntent2 = PendingIntent.getActivity(this, 0,
	                new Intent(this, Nepotom.class)
	                , 0);

	        mBuilder.setSmallIcon(R.drawable.icon)
	        .setContentTitle("Непотом!")
	        .setStyle(new NotificationCompat.BigTextStyle()
	        .bigText(text))
	        .setContentText(text)
	        .setAutoCancel(true);

	        mBuilder.setContentIntent(contentIntent2);
	        mNotificationManager.notify(1, mBuilder.build());
	        
	        
	        StartMyServiceAtBootReceiver.completeWakefulIntent(intent);
		}

    }
    
    public void setNewAlarms(Db db){
    	Cursor c = db.getAllRecentMessages();
    	if (c.moveToFirst()){    	
    		do{
    			setNewAlarm( c.getString(1), c.getLong(0), c.getLong(3) - System.currentTimeMillis());
    		}while(c.moveToNext());
    	}
    }
    
    public void setNewAlarm(String friendName, long sentTime, long timeToExist){
    	Intent testIntentServiceIntent = new Intent();
    	testIntentServiceIntent.setClassName(getPackageName(), TestIntentService.class.getName());
    	
    	String uri = "http://gtflix.com?name=" + friendName + "&sentTime=" + String.valueOf(sentTime);
    	testIntentServiceIntent.setData( Uri.parse(uri) );
    	testIntentServiceIntent.putExtra("notificationId", 1);
    	PendingIntent pi = PendingIntent.getService(this, 0, testIntentServiceIntent, 0);
    	
    	AlarmManager am = (AlarmManager) getSystemService(Context.ALARM_SERVICE);
    	
    	am.set( AlarmManager.RTC_WAKEUP, sentTime + timeToExist, pi );
    }
    
    public void createNotification(String string, int id){
    	NotificationManager mNotificationManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
		NotificationCompat.Builder mBuilder = new NotificationCompat.Builder(this);
    	PendingIntent contentIntent2 = PendingIntent.getActivity(this, 0,
                new Intent(this, Nepotom.class)
                , 0);

        mBuilder.setSmallIcon(R.drawable.icon)
        .setContentTitle("Хей!")
        .setStyle(new NotificationCompat.BigTextStyle()
        .bigText(string))
        .setContentText(string)
        .setAutoCancel(true);

        mBuilder.setContentIntent(contentIntent2);
        mNotificationManager.notify(1, mBuilder.build());
    }
}
