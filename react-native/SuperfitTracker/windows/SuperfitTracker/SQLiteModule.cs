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
            object[] convertedParams = ReactJsonConverter.jsonToReact(parms);

            this.execute(query, new CallbackContext(success, error), convertedParams);
        }

        [ReactMethod]
        public void sqlBatch(JArray queries, ICallback success, ICallback error)
        {
            try
            {
                DbConnection.BeginTransaction();

                foreach (JToken parsedValue in queries.Children())
                {
                    JArray parameters = new JArray();
                    String query = null;

                    if (parsedValue.Type == JTokenType.Array)
                    {

                        foreach (JToken token in parsedValue.Value<JArray>().Children())
                        {
                            if (token.Type == JTokenType.String)
                            {
                                query = token.Value<String>();
                            }
                            else
                            {
                                parameters.Add(token.ToObject<Object>());
                            }
                        }
                    }
                    else if (parsedValue.Type == JTokenType.String)
                    {
                        query = parsedValue.Value<String>();
                    }

                    object[] parms = ReactJsonConverter.jsonToReact(parameters);

                    if (query != null)
                    {
                        bool result = this.execute(query, new CallbackContext(success, error), parms);

                        if (!result)
                        {
                            DbConnection.Rollback();
                            break;
                        }
                    } else
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

        private bool execute(string query, CallbackContext callbackContext, params object[] parms)
        {
            try
            {
                if (query.ToLower().StartsWith("select"))
                {
                    SQLiteCommand command = DbConnection.CreateCommand(query, parms);

                    List<Activity> results = command.ExecuteQuery<Activity>();
    
                    JObject jsonObject = new JObject();
                    JArray jsonArray = new JArray();

                    foreach(Activity result in results)
                    {
                        JObject rowResult = new JObject();

                        rowResult.Add("id", new JValue(result.id));
                        rowResult.Add("type", new JValue(result.type));
                        rowResult.Add("dt", new JValue(result.dt));
                        rowResult.Add("gps_data", new JValue(result.gps_data));

                        jsonArray.Add(rowResult);    
                    }

                    jsonObject.Add("rows", jsonArray);
                    callbackContext.success(jsonObject);
                }
                else
                {
                    SQLiteCommand sql = DbConnection.CreateCommand(query);

                    if (parms.Length == 1 && parms is object[])
                    {
                        var insertParams = (object[])parms[0];

                        for (int i = 0; i < insertParams.Length; i++)
                        {
                            sql.Bind(insertParams[i]);
                        }
                    }

                    int rows = sql.ExecuteNonQuery();

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
