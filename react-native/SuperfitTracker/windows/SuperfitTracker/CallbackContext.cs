using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ReactNative.Bridge;
using Windows.Data.Json;
using ReactNative.Collections;
using Newtonsoft.Json.Linq;

namespace SuperfitTracker
{
    public class CallbackContext
    {
        private const string LOG_TAG = "SQLiteModuleWindows";

        private ICallback successCallback;
        private ICallback errorCallback;

        public CallbackContext(ICallback success, ICallback error)
        {
            this.successCallback = success;
            this.errorCallback = error;
        }

        /**
         * Helper for success callbacks that just returns the Status.OK by default
         *
         * @param message The message to add to the success result.
         */
        public void success(JsonObject message)
        {
            try
            {
                System.Collections.Generic.IReadOnlyDictionary<String, Object> writableMap = ReactJsonConverter.jsonToReact(message);
                successCallback.Invoke(writableMap);
            }
            catch(Exception ex)
            {
                errorCallback.Invoke("Internal error converting results:" + ex.Message);
            }
        }

        /**
         * Helper for success callbacks that just returns the Status.OK by default
         *
         * @param message The message to add to the success result.
         */
        public void success(String message)
        {
            successCallback.Invoke(message);
        }

        /**
         * Helper for success callbacks that just returns the Status.OK by default
         *
         * @param message The message to add to the success result.
         */
        public void success(JArray message)
        {
            try
            {
                Object[] writableArray = ReactJsonConverter.jsonToReact(message);
                successCallback.Invoke(writableArray);
            }
            catch (Exception ex)
            {
                errorCallback.Invoke("Internal error converting results:" + ex.Message);
            }

        }

        /**
         * Helper for success callbacks that just returns the Status.OK by default
         */
        public void success()
        {
            successCallback.Invoke("Success");
        }

        /**
         * Helper for error callbacks that just returns the Status.ERROR by default
         *
         * @param message The message to add to the error result.
         */
        public void error(JsonObject message)
        {
            try
            {
                Dictionary<String, Object> writableMap = ReactJsonConverter.jsonToReact(message);
                errorCallback.Invoke(writableMap);
            }
            catch (Exception ex)
            {
                errorCallback.Invoke("Internal error converting results:" + ex.Message);
            }
        }

        /**
         * Helper for error callbacks that just returns the Status.ERROR by default
         *
         * @param message The message to add to the error result.
         */
        public void error(String message)
        {
            if (errorCallback != null)
            {
                errorCallback.Invoke(message);
            }
        }
    }
}
