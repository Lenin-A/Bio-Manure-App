import React, { useState, useEffect } from 'react';
import { View, Text, Button, Dimensions, Alert, ScrollView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const ESP32_IP = '192.168.0.100'; // Replace with your ESP32 IP

const App = () => {
    const [sensorData, setSensorData] = useState({
        temperature: 0,
        gasLevel: 0,
        humidity: 0,
        soilMoisture: 0,
    });
    const [temperatureData, setTemperatureData] = useState([]);
    const [gasLevelData, setGasLevelData] = useState([]);
    const [humidityData, setHumidityData] = useState([]);
    const [soilMoistureData, setSoilMoistureData] = useState([]);

    useEffect(() => {
        const interval = setInterval(fetchSensorData, 5000); // Fetch every 5 seconds
        return () => clearInterval(interval);
    }, []);

    const fetchSensorData = async () => {
        try {
            const response = await fetch(`http://${ESP32_IP}/data`);
            if (!response.ok) {
                throw new Error('Failed to fetch data from ESP32');
            }

            const textResponse = await response.text();
            console.log('Raw response:', textResponse);

            // Ensure valid JSON format
            const validJSON = textResponse.trim().endsWith('}')
                ? textResponse.trim()
                : `${textResponse.trim()}}`;

            const data = JSON.parse(validJSON);
            if (
                typeof data.temperature === 'number' &&
                typeof data.gasLevel === 'number' &&
                typeof data.humidity === 'number' &&
                typeof data.soilMoisture === 'number'
            ) {
                setSensorData(data);
                // Only update temperature and gas level data
                setTemperatureData(prev => [...prev, data.temperature]);
                setGasLevelData(prev => [...prev, data.gasLevel]);
            } else {
                console.warn('Invalid data format:', data);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            Alert.alert('Error', 'Failed to fetch data from ESP32. Please check the connection.');
        }
    };

    const cleanTemperatureData = temperatureData.filter(val => typeof val === 'number');
    const cleanGasLevelData = gasLevelData.filter(val => typeof val === 'number');
    const cleanHumidityData = humidityData.filter(val => typeof val === 'number');
    const cleanSoilMoistureData = soilMoistureData.filter(val => typeof val === 'number');

    return (
        <ScrollView>
            <View style={{ flex: 1, padding: 20, backgroundColor: '#f5f5f5' }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' }}>
                    Bio Manure Monitoring
                </Text>

                {/* Display Sensor Data */}
                <View
                    style={{
                        marginBottom: 20,
                        padding: 16,
                        backgroundColor: '#ffffff',
                        borderRadius: 8,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 4,
                    }}
                >
                    <Text style={{ fontSize: 22, marginBottom: 12 }}>
                        🌡️ Temperature: <Text style={{ fontWeight: 'bold' }}>{sensorData.temperature}°C</Text>
                    </Text>
                    <Text style={{ fontSize: 22, marginBottom: 12 }}>
                        💨 Gas Level: <Text style={{ fontWeight: 'bold' }}>{sensorData.gasLevel}%</Text>
                    </Text>
                    <Text style={{ fontSize: 22, marginBottom: 12 }}>
                        💧 Humidity: <Text style={{ fontWeight: 'bold' }}>{sensorData.humidity}%</Text>
                    </Text>
                    <Text style={{ fontSize: 22 }}>
                        🌱 Soil Moisture: <Text style={{ fontWeight: 'bold' }}>{sensorData.soilMoisture}%</Text>
                    </Text>
                </View>

                <Button title="Fetch Data" onPress={fetchSensorData} />

                {/* Chart Section */}
                <Text style={{ fontSize: 20, fontWeight: 'bold', marginVertical: 16 }}>
                    Real time data - Temperature vs Gas Level
                </Text>

                {cleanTemperatureData.length > 0 ? (
                    <LineChart
                        data={{
                            labels: Array.from({ length: cleanTemperatureData.length }, (_, index) => `${index + 1}`),
                            datasets: [
                                {
                                    data: cleanTemperatureData,
                                    color: () => `rgba(255, 0, 0, 1)`, // Red for temperature
                                    strokeWidth: 2,
                                },
                                {
                                    data: cleanGasLevelData,
                                    color: () => `rgba(0, 0, 255, 1)`, // Blue for gas level
                                    strokeWidth: 2,
                                },
                                {
                                    data: cleanHumidityData, // Will not change unless manually updated
                                    color: () => `rgba(0, 128, 0, 1)`, // Green for humidity
                                    strokeWidth: 2,
                                },
                                {
                                    data: cleanSoilMoistureData, // Will not change unless manually updated
                                    color: () => `rgba(255, 165, 0, 1)`, // Orange for soil moisture
                                    strokeWidth: 2,
                                },
                            ],
                        }}
                        width={Dimensions.get('window').width - 40} // Full width minus padding
                        height={250}
                        chartConfig={{
                            backgroundColor: '#ffffff',
                            backgroundGradientFrom: '#ffffff',
                            backgroundGradientTo: '#ffffff',
                            decimalPlaces: 2,
                            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                            style: {
                                borderRadius: 16,
                            },
                            propsForDots: {
                                r: '6',
                                strokeWidth: '2',
                                stroke: '#ffa726',
                            },
                        }}
                        bezier
                        style={{
                            marginVertical: 8,
                            borderRadius: 16,
                        }}
                    />
                ) : (
                    <Text>No data available yet.</Text>
                )}
            </View>
        </ScrollView>
    );
};

export default App;
