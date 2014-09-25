/*
       Licensed to the Apache Software Foundation (ASF) under one
       or more contributor license agreements.  See the NOTICE file
       distributed with this work for additional information
       regarding copyright ownership.  The ASF licenses this file
       to you under the Apache License, Version 2.0 (the
       "License"); you may not use this file except in compliance
       with the License.  You may obtain a copy of the License at

         http://www.apache.org/licenses/LICENSE-2.0

       Unless required by applicable law or agreed to in writing,
       software distributed under the License is distributed on an
       "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
       KIND, either express or implied.  See the License for the
       specific language governing permissions and limitations
       under the License.
 */

package com.gtflix;

import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.util.Log;
import com.gtflix.receivers.GcmBroadcastReceiver;

import org.apache.cordova.*;



public class Nepotom extends DroidGap
{
	static Context context;
	static PackageManager pm;
	static ComponentName cn;
	
    @Override
    public void onCreate(Bundle savedInstanceState)
    {
        super.onCreate(savedInstanceState);

        context = getApplicationContext();
        cn = new ComponentName(this, GcmBroadcastReceiver.class);
    	pm = this.getPackageManager();      
        
        super.setIntegerProperty("loadUrlTimeoutValue", 60000);
        super.loadUrl(Config.getStartUrl());
    }
    
    public void onPause(){
    	super.onPause();
    	Log.i("ON >>>", "PAUSE");
    	enableGcmReceiver();
    }

    public void onResume(){
    	super.onResume();
    	Log.i("ON >>>", "RESUME");
    	disableGcmReceiver();
    }
	
	public void onNewIntent(Intent intent){
		super.onNewIntent(intent);
	}
	
    public static Context getAppContext() {
        return context;
    }
    
    public void disableGcmReceiver(){
    	pm.setComponentEnabledSetting(cn,
    	PackageManager.COMPONENT_ENABLED_STATE_DISABLED, PackageManager.DONT_KILL_APP);
    }
    
    public void enableGcmReceiver(){
    	pm.setComponentEnabledSetting(cn,
    	    	PackageManager.COMPONENT_ENABLED_STATE_ENABLED, PackageManager.DONT_KILL_APP);
    }
}

