package com.gtflix.receivers;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.support.v4.content.WakefulBroadcastReceiver;
import com.gtflix.services.TestIntentService;

public class StartMyServiceAtBootReceiver extends WakefulBroadcastReceiver{

	@Override
	public void onReceive(Context context, Intent intent) {
		Intent i = new Intent(context, TestIntentService.class);
		startWakefulService(context, i);
		setResultCode(Activity.RESULT_OK);
	}

}
