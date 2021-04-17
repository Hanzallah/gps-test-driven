import time
import datetime
import json
from selenium import webdriver
from selenium.common.exceptions import NoSuchElementException

class Tester:
    def __init__(self):
        super().__init__()
        self.init_tester()
        self.url = "http://localhost:3000/"
 
    '''
    -- Initialize the selenium firefox driver
    '''
    def init_tester(self):
        try:
            self.driver = webdriver.Firefox(executable_path="geckodriver.exe")
        except:
            raise Exception('Could not connect to the browser.')
    
    
    '''
    -- Verify that longitudes and latitudes are formatted correctly
    -- Verify if the longitudes and latitudes entered point to the correct city
    '''
    def verify_city(self, latitude, longitude, cityName, testName='Verify City'):
        log_data = {'test_name':testName, 'messages':[], 'error':[]}
        
        try:
            self.longitude_field.clear()
            self.latitiude_field.clear()

            self.longitude_field.send_keys(longitude)
            self.latitiude_field.send_keys(latitude)

            self.get_loc_submit.click()
            time.sleep(0.4)

            if self.driver.find_element_by_id("invalidLongtiude").is_displayed() and self.driver.find_element_by_id("invalidLatitude").is_displayed():
                log_data['messages'].append("Invalid latitude and longitude")
            elif self.driver.find_element_by_id("invalidLongtiude").is_displayed():
                log_data['messages'].append("Invalid longitude")
            elif self.driver.find_element_by_id("invalidLatitude").is_displayed():
                log_data['messages'].append("Invalid latitude")
            elif self.driver.find_element_by_id("noCoordinates").is_displayed():
                log_data['messages'].append("City with given co-ordinates could not be found")
            elif self.driver.find_element_by_id("city").text != cityName:
                log_data['messages'].append("Invalid city retrieved")
            elif self.driver.find_element_by_id("city").text == cityName:
                log_data['messages'].append(f"{testName} Passed")
        except NoSuchElementException as e:
            log_data['error'].append("Test failed")
        except Exception as e:
            log_data['error'].append(str(e))
        
        self.logger(log_data)

    '''
    -- Verify the distance from the nearest city center using GPS
    -- Verify coordinates received from the GPS
    '''
    def verify_distance_city(self, cityName, testName='Verify Distance to Nearist City'):
        log_data = {'test_name':testName, 'messages':[], 'error':[]}

        try:
            if self.driver.find_element_by_id("nearestCity").text != cityName:
                log_data['messages'].append("Invalid city retrieved")
            elif self.driver.find_element_by_id("nearestCity").text == cityName and self.driver.find_element_by_id("distanceCity").is_displayed():
                log_data['messages'].append(f"{testName} Passed")
            else:
                log_data['messages'].append("Invalid distance")
        except NoSuchElementException as e:
            log_data['error'].append("Test failed")
        except Exception as e:
            log_data['error'].append(str(e))
        
        self.logger(log_data)

    '''
    -- Verify the distance from the center of the Earth using GPS or manual fields
    '''
    def verify_distance_earth(self, latitude, longitude, gps=False, testName='Verify Distance To Earth Center'):
        log_data = {'test_name':testName, 'messages':[], 'error':[]}
        
        try:
            if (not gps):
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
                if self.driver.find_element_by_id("distanceEarth").is_displayed():
                    log_data['messages'].append(f"{testName} Passed")
            else:
                
                if self.driver.find_element_by_id("distanceEarth").is_displayed():
                    log_data['messages'].append(f"{testName} Passed")
                else:
                    log_data['messages'].append("Invalid distance")
        except NoSuchElementException as e:
            log_data['error'].append("Test failed")
        except Exception as e:
            log_data['error'].append(str(e))
        
        self.logger(log_data)

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
                        file.write(f"\n- Message - {msg}")
                file.write(f"\nErrors:")
                if (len(log_data['error']) > 0):
                    for err in log_data['error']:
                        file.write(f"\n- Error - {err}")
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

        self.latitiude_field = self.driver.find_element_by_id("latitude")
        self.longitude_field = self.driver.find_element_by_id("longitude")
        self.get_loc_submit = self.driver.find_element_by_id("sendCoordinateButton")

        '''
        -- TEST 01
        '''
        self.verify_city("39.916668", "116.383331", "Beijing")
        self.verify_city("39.916668", "116.383331", "Izmir")
        self.verify_city("40.730610","-73.935242", "New York")
        self.verify_city("xyz","29.145423","Washington")
        self.verify_city("12.145423","-29.145423", "Washington")
        self.verify_city(" "," ", "Washington")
        self.verify_city("12.145423"," ", "Washington")
        self.verify_city(" ","29.145423", "Washington")
        self.verify_city("$$","54.145423", "Washington")
        self.verify_city("0.145423","0.145423", "Washington")

        '''
        -- TEST 02
        '''
        # self.verify_distance_city("Ankara")
        # self.driver.refresh()
        # self.verify_distance_city("Izmir")
        # self.driver.refresh()
        # self.verify_distance_city("Washington")
        # self.driver.refresh()
        # self.verify_distance_city("123")
        # self.driver.refresh()
        # self.verify_distance_city("xyz")
        # self.driver.refresh()

        '''
        -- TEST 03
        '''
        # self.verify_distance_earth("39", "32")
        # self.driver.refresh()
        # self.verify_distance_earth("39", "32", True)
        # self.driver.refresh()
        # self.verify_distance_earth("abc", "xyz")
        # self.driver.refresh()


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