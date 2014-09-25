package com.gtflix.helpers;

import java.io.File;
import java.text.SimpleDateFormat;
import java.util.Date;

import android.content.Context;
import android.content.SharedPreferences;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;

public class Db {
	private SharedPreferences prefs;
	private SQLiteDatabase db;
	
	public Db(Context ctx){
		String myPath = ctx.getApplicationContext().getFilesDir().getAbsolutePath() + File.separator + "nepotom.db";
		this.db = SQLiteDatabase.openOrCreateDatabase(myPath, null);
		this.prefs = ctx.getApplicationContext().getSharedPreferences("SQL", Context.MODE_PRIVATE);
	}
	
	public boolean createRecentMessagesTable(){
		String CREATE_RECENT_MESSAGES_TABLE = "CREATE TABLE IF NOT EXISTS recent_messages ( " +
                "sent_time INTEGER, friend_name TEXT, message TEXT, timeToExist INTEGER, " + 
				"PRIMARY KEY(sent_time, friend_name))";
 
        db.execSQL(CREATE_RECENT_MESSAGES_TABLE);
        SharedPreferences.Editor editor = prefs.edit();
        editor.putBoolean("isRecentMessagesExists", true);
        editor.commit();
		return true;
	}
	
	public boolean addEntryToRecentMessages(long timestamp, long timeToExists, String name, String message){
		db.execSQL("INSERT INTO recent_messages (sent_time, timeToExist, friend_name, message) " +
	        	"VALUES(" + timestamp + ", " + timeToExists + ", '" + name +"','"+ message +"')");
		return true;
	}
	
	public Cursor getAllRecentMessages(){
		return db.rawQuery("SELECT * FROM recent_messages", null);
	}
	
	public String getRecentMessage(int limit){
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		String msg = "";
    	Cursor c = db.rawQuery("SELECT * FROM recent_messages ORDER BY sent_time DESC LIMIT " + String.valueOf(limit), null);
    	if (c.moveToFirst()){    	
    		do{
    			msg += c.getString(2) + " от " + c.getString(1) + " в " + sdf.format( new Date( c.getLong(0) ) ) + "\n";
    		}while(c.moveToNext());
    	}
    	return msg;
	}
	
	public boolean removeAllOldMessages(long timeNow){
		if(prefs.getBoolean("isRecentMessagesExists", false)){
			db.execSQL("DELETE FROM recent_messages WHERE timeToExist <= " + String.valueOf(timeNow));
			return true;
		}else
			return false;
	}
	
	public boolean removeRecentMessage(long sentTime, String name){
		db.execSQL("DELETE FROM recent_messages WHERE sent_time = " + sentTime + " AND friend_name = '" + name +"'");
		return true;
	}
	
	public boolean removeAllRecentMessages(){
		if(prefs.getBoolean("isRecentMessagesExists", false)){
			db.execSQL("DELETE FROM recent_messages");
			return true;
		}else
			return false;
	}
	
	public void finalize() throws Throwable{
		super.finalize();
		db.close();
	}

}
