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
        public static Dictionary<string, object> jsonToReact(JsonObject jsonObject)
        {
            Dictionary<string, object> writableMap = new Dictionary<string, object>();

            foreach (String key in jsonObject.Keys)
            {
                Object value = jsonObject.GetNamedObject(key);

                if (value is float || value is double || value is int) {
                    writableMap.Add(key, jsonObject.GetNamedNumber(key));
                } else if (value is string) {
                    writableMap.Add(key, jsonObject.GetNamedString(key));
                } else if (value is JsonObject) {
                    writableMap.Add(key, jsonObject.GetNamedObject(key));
                } else if (value is JsonArray) {
                    writableMap.Add(key, jsonObject.GetNamedArray(key));
                } else if (value == null) {
                    writableMap.Add(null, null);
                }
            }
 
            return writableMap;
        }

        public static Object[] jsonToReact(JArray jsonArray)
        {
            Object[] writableArray = new Object[jsonArray.Count];

            for (int i = 0; i < jsonArray.Count; i++)
            {
                Object value = jsonArray[i];
                uint index = (uint)i;

                if (value is float || value is double || value is int) {
                    writableArray[i] = value;
                } else if (value is string) {
                    writableArray[i] = value;
                } else if (value is Object) {
                    writableArray[i] = value;
                } else if (value is JsonArray) {
                    writableArray[i] = value;
                } else if (value == null) {
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
