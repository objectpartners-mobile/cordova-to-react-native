using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Diagnostics;
using System.Threading.Tasks;
using ReactNative.Bridge;
using SQLite.Net;
using SQLite.Net.Platform.WinRT;
using Windows.Storage;
using System.IO;
using Windows.Data.Json;
using SuperfitTracker;
using Newtonsoft.Json.Linq;

namespace ReactNative.Modules.SQLiteModule
{
    class SQLiteModule : ReactContextNativeModuleBase, ILifecycleEventListener
    {

        private static String dbName = "superfit.db";

        private static SQLiteConnection DbConnection
        {
            get
            {
                return new SQLiteConnection(
                    new SQLitePlatformWinRT(),
                    Path.Combine(ApplicationData.Current.LocalFolder.Path, dbName));
            }
        }

        public SQLiteModule(ReactContext reactContext): base(reactContext)
        {
        }

        public override string Name
        {
            get
            {
                return "SQLiteModuleWindows";
            }
        }

        [ReactMethod]
        public void openDatabase(String dbname, string assetFilePath, int openFlags, CallbackContext cbc)
        {
            if (DbConnection == null)
            {
                cbc.error("Could not open database.");
            } else
            {
                cbc.success();
            }

        }

        [ReactMethod]
        public void executeSql(string query, JArray parms, ICallback success, ICallback error)
        {
            Object[] convertedParams = ReactJsonConverter.jsonToReact(parms);

            this.execute(query, convertedParams, new CallbackContext(success, error));
        }

        [ReactMethod]
        public void sqlBatch(JArray queries, ICallback success, ICallback error)
        {
            try
            {
                DbConnection.BeginTransaction();

                for (int i = 0; i < queries.Count; i++)
                {
                    string query = (string)queries[i];
                    Object[] parms = new Object[0];//queryObject.Length > 1 ? (Object[])queryObject[1] : new Object[0];

                    bool result = this.execute(query, parms, new CallbackContext(success, error));

                    if (!result)
                    {
                        DbConnection.Rollback();
                        break;
                    }
                }

                DbConnection.Commit();
            }
            catch (Exception ex)
            {
                error.Invoke("Unexpected error");
            }
        }

        private bool execute(string query, Object[] parms, CallbackContext callbackContext)
        {
            try
            {
                if (query.ToLower().StartsWith("select"))
                {
                    SQLiteCommand command = DbConnection.CreateCommand(query, parms);

                    List<Activity> results = command.ExecuteQuery<Activity>();
    
                    JsonObject jsonObject = new JsonObject();
                    JsonArray jsonArray = new JsonArray();

                    foreach(Activity result in results)
                    {
                        JsonObject rowResult = new JsonObject();
                        rowResult.Add("id", JsonValue.CreateNumberValue(result.id));
                        rowResult.Add("type", JsonValue.CreateNumberValue(result.id));
                        rowResult.Add("dt", JsonValue.CreateNumberValue(result.id));
                        rowResult.Add("gps_data", JsonValue.CreateNumberValue(result.id));

                        jsonArray.Add(rowResult);    
                    }

                    jsonObject.Add("rows", jsonArray);
                    callbackContext.success(jsonObject);
                }
                else
                {
                    DbConnection.Execute(query, parms);
                    callbackContext.success();
                }
            }
            catch (Exception ex)
            {
                callbackContext.error(ex.Message);
                return false;
            }

            return true;
        }

        public void OnSuspend()
        {
            //throw new NotImplementedException();
        }

        public void OnResume()
        {
            //throw new NotImplementedException();
        }

        public void OnDestroy()
        {
            //throw new NotImplementedException();
        }

        public class Activity
        {
            //id, type, dt, gps_data
            public int id { get; set; }
            public string type { get; set; }
            public string dt { get; set; }
            public string gps_data { get; set; }
        }
    }
}
