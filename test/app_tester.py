import time
import datetime
import json
from selenium import webdriver
from selenium.common.exceptions import NoSuchElementException

class Tester:
    def __init__(self):
        super().__init__()
        self.init_tester()
        self.url = "http://localhost:3000/signin"
        self.latitiude_field = self.driver.find_element_by_id("latitude")
        self.longitude_field = self.driver.find_element_by_id("longitude")
        self.get_loc_btn = self.driver.find_element_by_id("getLocBtn")
        self.get_loc_submit = self.driver.find_element_by_id("getLocSubmit")
 
    '''
    -- Initialize the selenium firefox driver
    '''
    def init_tester(self):
        try:
            self.driver = webdriver.Firefox(executable_path="geckodriver.exe")
        except:
            raise Exception('Could not connect to the browser.')
    
    
    '''
    -- Verify if the longitudes and latitudes entered point to the correct city
    '''
    def verify_city(self, latitude, longitude, cityName):
        log_data = {'test_name':'Verify City Test', 'messages':[], 'error':''}
        
        try:
            self.get_loc_submit.click()
            time.sleep(0.1)

            self.longitude_field.clear()
            self.latitiude_field.clear()

            self.longitude_field.send_keys(longitude)
            self.latitiude_field.send_keys(latitude)

            self.get_loc_btn.click()
            time.sleep(0.1)

            if self.driver.find_element_by_id("invalidLongtiude").is_displayed():
                log_data['messages'].append("Invalid longitude")
            if self.driver.find_element_by_id("invalidLatitude").is_displayed():
                log_data['messages'].append("Invalid latitude")
            if self.driver.find_element_by_id("invalidCity").is_displayed():
                log_data['messages'].append("Invalid city")
            if self.driver.find_element_by_id("nearestCity").text != cityName:
                log_data['messages'].append("Invalid city retrieved")
            elif self.driver.find_element_by_id("nearestCity").text == cityName:
                log_data['messages'].append("Test Passed")
        except NoSuchElementException as e:
            log_data['messages'].append("Test failed")
        except Exception as e:
            log_data['error'] = str(e)
        
        self.logger(log_data)

    '''
    -- Verify the distance from the nearest city center using GPS
    '''
    def verify_distance_city(self):
        pass

    '''
    -- Verify the distance from the center of the Earth using GPS or manual fields
    '''
    def verify_distance_earth(self):
        pass

    '''
    -- Enables the logging of test results to a file
    '''
    def logger(self, log_data):
        try:
            with open("login_test_logs.txt", "a") as file:
                file.write("--------------------------------------\nTest Name:\n- ")
                file.write(log_data['test_name'])
                file.write(f"\nMessages:")
                if (len(log_data['messages']) > 0):
                    for msg in log_data['messages']:
                        file.write(f"\n- {msg}")
                if log_data['error'] == "":
                    file.write(f"\nError:\n- None")
                else:
                    file.write(f"\nError:\n- {log_data['error']}")
                file.write('\n')
            file.close
        except:
            print("Couldn't write to file")

    '''
    -- Run all defined tests and log the results
    '''
    def test_runner(self):
        start = time.time()
        self.driver.get(self.url)

        '''
        -- TEST 01 - 
        '''
        self.verify_city("","")
        self.driver.refresh()


        self.dispose()
        end = time.time()
        print(f'Program time: {end-start}')
    
    '''
    -- Dispose the driver once all tests are completed
    '''
    def dispose(self):
        self.driver.close()
'''
-- Script runner section
'''
def main():
    tester = Tester()
    tester.test_runner()

if __name__ == '__main__':
    main()