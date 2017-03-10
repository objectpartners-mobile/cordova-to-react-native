using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Windows.Data.Json;
using Windows.Foundation.Collections;

namespace SuperfitTracker
{
    class ReactJsonConverter
    {
        public static Dictionary<string, object> jsonToReact(JObject jsonObject)
        {
            Dictionary<string, object> writableMap = new Dictionary<string, object>();
            IList<string> keys = jsonObject.Properties().Select(p => p.Name).ToList();

            foreach (String key in keys)
            {
                JToken jToken = jsonObject.GetValue(key);
                JTokenType value = jToken.Type;

                if (value == JTokenType.Float|| value == JTokenType.Integer) {
                    writableMap.Add(key, jToken.ToObject<Double>());
                } else if (value == JTokenType.String) {
                    writableMap.Add(key, jToken.ToObject<String>());
                } else if (value == JTokenType.Object) {
                    writableMap.Add(key, jToken.ToObject<JObject>());
                } else if (value == JTokenType.Array) {
                    writableMap.Add(key, jToken.ToObject<JArray>());
                } else if (value == JTokenType.Null) {
                    writableMap.Add(null, null);
                }
            }
 
            return writableMap;
        }

        public static object[] jsonToReact(JArray jsonArray)
        {
            object[] writableArray = new object[jsonArray.Count];

            for (int i = 0; i < jsonArray.Count; i++)
            {
                JToken jToken = jsonArray[i];
                JTokenType value = jToken.Type;

                if (value == JTokenType.Float || value == JTokenType.Integer)
                {
                    writableArray[i] = jToken.ToObject<Double>();
                }
                else if (value == JTokenType.String)
                {
                    writableArray[i] = jToken.ToObject<String>();
                }
                else if (value == JTokenType.Object)
                {
                    writableArray[i] = jsonToReact(jToken.ToObject<JObject>());
                }
                else if (value == JTokenType.Array)
                {
                    writableArray[i] = jsonToReact(jToken.ToObject<JArray>());
                }
                else if (value == JTokenType.Null)
                {
                    writableArray[i] = null;
                }
            }

            return writableArray;
        }

        public static JsonObject reactToJSON(Dictionary<String, Object> readableMap)
        {
            JsonObject jsonObject = new JsonObject();

            foreach(String key in readableMap.Keys)
        {
                Type valueType = readableMap[key].GetType();

                Object value = readableMap[key];

                if (value == null)
                {
                    jsonObject.Add(key, null);
                } else if (value is bool)
                {
                    jsonObject.Add(key, JsonValue.CreateBooleanValue(Boolean.Parse(value.ToString())));
                } else if (value is double || value is int || value is float)
                {
                    jsonObject.Add(key, JsonValue.CreateNumberValue(Double.Parse(value.ToString())));
                } else if (value is string)
                {
                    jsonObject.Add(key, JsonValue.CreateStringValue(value.ToString()));
                } else if (value is Dictionary<String, Object>)
                {
                    jsonObject.Add(key, reactToJSON((Dictionary<String, Object>)value));
                } else if (value is Object[])
                {
                    jsonObject.Add(key, reactToJSON((Object[])value));
                }
        }

        return jsonObject;
    }

        public static JsonArray reactToJSON(Object[] readableArray)
        {
            JsonArray jsonArray = new JsonArray();
        for(int i = 0; i<readableArray.Length; i++) {
                Object value = readableArray[i];

                if (value == null)
                {
                    jsonArray.Add(null);
                }
                else if (value is bool)
                {
                    jsonArray.Add(JsonValue.CreateBooleanValue(Boolean.Parse(value.ToString())));
                }
                else if (value is double || value is int || value is float)
                {
                    jsonArray.Add(JsonValue.CreateNumberValue(Double.Parse(value.ToString())));
                }
                else if (value is string)
                {
                    jsonArray.Add(JsonValue.CreateStringValue(value.ToString()));
                }
                else if (value is Dictionary<String, Object>)
                {
                    jsonArray.Add(reactToJSON((Dictionary<String, Object>)value));
                }
                else if (value is Object[])
                {
                    jsonArray.Add(reactToJSON((Object[])value));
                }
    }
        return jsonArray;
    }
    }
}
