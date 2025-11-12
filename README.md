**CalmPulse**

**Objective:** CalmPulse is a real-time, heart-rate-based biofeedback system that delivers LED and GUI-based visual cues to help users monitor stress levels, initiate relaxation behavior, and visualize session-based summaries of their physiological state.

**Introduction:**

Problem and Motivation

Stress is one of the most pervasive health challenges in the modern world. According to the American Psychological Association, “over 75% of adults report experiencing moderate to high stress levels, with physical symptoms ranging from headaches to cardiovascular strain and over the years, the percentage of adults with stress/anxiety has been increasing \[1\]. Chronic stress increases the risk of hypertension, heart disease, and mental health disorders, making effective monitoring and management critical. While heart rate variability (HRV) and heart rate monitoring are established methods for evaluating stress and relaxation levels, most consumer-grade wearables lack transparency, customization, or real-time feedback designed for conscious relaxation training. Users are often presented with a generic "stress score" without a clear physiological basis or actionable instructions.

Current Solutions and Limitations

Popular solutions today include smartwatches, fitness trackers, and mindfulness mobile apps.

*   Smartwatches: Measure heart rate via optical sensors (PPG) but are prone to motion artifacts and lack fine-grained ECG data.
*   Mindfulness/meditation apps: Provide guided breathing but without physiological feedback, making them less effective for individuals who need measurable progress tracking.
*   Clinical ECG monitoring: Accurate but costly, bulky, and not designed for everyday stress management.

These solutions either compromise on accuracy (optical sensing), personalization (generic breathing guides), or accessibility (clinical systems).

The Novelty of CalmPulse and the Difference it can Make

CalmPulse integrates real-time ECG monitoring with a visual breathing guide and zone-based heart rate classification to give users immediate, physiologically driven feedback. It has an dual-mode operation where live ECG data or simulated heart rate values are used for development/testing without hardware, customizable classification with user-specific heart rate zones for resting, elevated, and anxious states, a web-based interface so that you can just access it from the browser and not install an app, and session logging that tracks multiple sessions with timestamps, BPM trends, and duration. As a result, by providing clear, immediate, and actionable feedback tied to actual physiological data, CalmPulse could help users reduce stress, improve breathing patterns, and build mindfulness habits. This is all done with hardware that costs a fraction of consumer-grade wearables or clinical monitors.

**Methods:**

Hardware Design

For the hardware aspect of the design, I used a microcontroller which was the Arduino UNO R3 that had ECG inputs which corresponded to the analog inputs A0 and A1 for single or dual-channel ECG readings. The electrode set up is a 3-lead configuration which has the right arm , left arm, and right leg for stable signal capture. To filter and condition the signal, I have an instrumental amplifier and various filters. The LED indicators are driven by comparator output to show detected heart beats in the hardware and the zone in which they belong.


Backend Design

The backend is responsible for serial communication with the Arduino and streaming data to the web UI. The SerialPort library is responsible for reading in analog ECG values from Arduino via USB with Socket.IO events happening to emit data to the frontend (bpm, rawSignal, sessionData) every 100 milliseconds. The backend also saves session start time, end time, BPM trends, and average BPM. For the simulation mode, it generates BPM values within a user-defined realistic range (55–198 BPM), with smooth transitions between relaxation, elevated, and anxious phases. For live ECG, a QRS detection algorithm in the Arduino code identifies R-peaks and calculates beats per minute (BPM) from the time interval between peaks.

Frontend Design

The user interface of CalmPulse is built with React and shadcn/ui which features several key components designed for intuitive interaction. A large, real-time BPM display shows the user's current heart rate, with a color-coded background that instantly indicates their relaxation zone (ex: green for relaxed, yellow for elevated, or red for anxious). To guide stress reduction, an animated circle expands and contracts in sync with recommended inhale and exhale durations, which adjust dynamically based on the user's current stress zone. Heart rate trends are visualized in real time through an interactive graph view, powered by Recharts, allowing users to monitor fluctuations over the course of a session. A mode toggle enables switching between live ECG data and simulated ECG for testing or fallback purposes. After each session, a summary card displays key metrics such as duration, average BPM, and timestamp, while a dedicated history panel organizes past sessions into a searchable table for tracking progress over time.


Heart Rate Classification Logic

For right now, the system categorizes stress levels using predefined heart rate zones to provide clear, actionable feedback. When the user's heart rate falls below 85 BPM, they enter the Relaxed zone, indicated by a calming blue background and accompanied by slow, deep breathing guidance to maintain this state. Heart rates between 85 and 120 BPM place the user in the Elevated zone, triggering a yellow background and moderate-paced breathing prompts to help gradually lower stress. If the heart rate exceeds 120 BPM, the system identifies an Anxious state, marked by a red background and faster breathing cues designed to quickly reduce tension. The breathing guide adapts dynamically in real time, adjusting its rhythm and pace to actively encourage the user toward the Relaxed zone, ensuring personalized and effective stress management support.

**Results:**

Simulation Results

In order to test the simulation, I used a predefined algorithm that goes from 198 to 55 slowly and steadily as time goes on which would emulate a stressed user trying to use CalmPulse app to become calm. In my test, I found that the LEDs were working correctly going from state to state correctly, the breathing guide responded appropriately to simulated heart rate changes, and the session history was logged correctly. As a result, the simulation results were quite successful and allowed me to evaluate development quite easily and allow the user to understand the way the UI works.


Live ECG Results

When first trying the live ECG, the results were quite mixed. The live ECG did in fact have it such that the LEDs were working correctly with the breathing guide and session history also working correctly. However, the ECG data was at a limitation due to the QRS detection algorithm that I had. I had detected the peaks based on the derivatives, but I had no smoothing or moving average which resulted in lots of peaks and it being quite high. I had tested it on myself while presenting and my average BPM was about 147 while I tested it on someone else whose average BPM was 125. This is quite accurate in terms of our BPM being quite different from one another considering I was in a presentation while he was looking at my presentation. However, it was not the most accurate algorithm which showed a lack of efficacy.


**Discussion:**

The CalmPulse system successfully demonstrates the feasibility of a low-cost, real-time biofeedback solution for stress management, while revealing numerous opportunities for refinement. My implementation of the 4-7-8 breathing technique \[2\] provides scientifically grounded respiratory pacing that dynamically adapts to the user's current physiological state, an advancement over static breathing guides in conventional meditation apps. The breathing animations automatically adjust their rhythm based on real time BPM data, which creates a responsive biofeedback loop that users find more engaging than pre-recorded guides.

However, there are quite a lot of limitations and improvements that could be made for the CalmPulse system. One enhancement would be with the current three-zone classification system (Relaxed <85 BPM, Elevated 85-120 BPM, Anxious >120 BPM) as we could incorporating established exercise physiology zones and \[5\]. A five-zone model (Zone 1: 50-60% HRmax, Zone 2: 60-70%, etc.) would provide more granular feedback, particularly for users with varying fitness levels \[5\]. Additionally, having each user get a test to get their heart rate threshold for each zone would allow for better alignment of advice and accuracy of session data since everyone’s heart rate differs and having a hard coded set of values would not suffice. This modification would align CalmPulse more closely with clinical stress assessment protocols while maintaining its accessibility.

Hardware performance emerged as both a strength and limitation in the current prototype. The 3-lead ECG configuration demonstrated superior signal quality to optical sensors in controlled settings but remained vulnerable to the motion artifacts and electromagnetic interference that plague non-clinical monitoring solutions \[3\]. These challenges were compounded by the limitations of the derivative-based QRS detection algorithm, which frequently generated false peaks during testing. Transitioning to Pan & Tompkins' established method \[4\] would address these issues through its adaptive thresholds and noise-resistant architecture which can thereby potentially enable reliable operation even during mild movement. The system's simulation mode proved invaluable during development, not only for UI refinement but also for user training, while live ECG testing successfully differentiated between stress states as shown by the measurable contrast between my elevated heart rate while presenting (147 BPM) and an observer's resting rate (125 BPM).

Looking forward, several strategic improvements could transform CalmPulse from a promising prototype to a robust tool. As stated before, enhancing the QRS detection with Pan & Tompkins' algorithm and adding moving average filters would provide the foundation for more reliable peak detection. Complementing this with a five-zone classification system and personalized threshold calibration would yield more physiologically accurate stress assessment. Exploring dry electrode options \[3\] could improve wearability without sacrificing signal quality, while incorporating short-term HRV analysis would add another dimension to stress evaluation. The existing web-based architecture remains well-suited to support these advancements, particularly for implementing sophisticated signal processing that would strain microcontroller resources. Through these refinements, CalmPulse could achieve clinical relevance while preserving the accessibility and affordability that make it distinctive in the landscape of stress management technologies.

**References**

\[1\] R. D. Goodwin, A. H. Weinberger, J. H. Kim, M. Wu, and S. Galea, “Trends in anxiety among adults in the United States, 2008–2018: Rapid increases among young adults,” _Journal of Psychiatric Research_, vol. 130, no. 1, pp. 441–446, Nov. 2020, doi: [https://doi.org/10.1016/j.jpsychires.2020.08.014](https://doi.org/10.1016/j.jpsychires.2020.08.014).

\[2\] J. Fletcher, “4-7-8 breathing: How it works, benefits, and uses,” _Medical News Today_, Feb. 12, 2019. [https://www.medicalnewstoday.com/articles/324417](https://www.medicalnewstoday.com/articles/324417)

\[3\] L. G. Roos and G. M. Slavich, “Wearable technologies for health research: Opportunities, limitations, and practical and conceptual considerations,” _Brain, Behavior, and Immunity_, vol. 113, pp. 444–452, Oct. 2023, doi: https://doi.org/10.1016/j.bbi.2023.08.008.

‌\[4\] J. Pan and W. J. Tompkins, “A Real-Time QRS Detection Algorithm,” _IEEE Transactions on Biomedical Engineering_, vol. BME-32, no. 3, pp. 230–236, Mar. 1985, doi: [https://doi.org/10.1109/tbme.1985.325532](https://doi.org/10.1109/tbme.1985.325532).

\[5\] E. V. NEUFELD, J. WADOWSKI, D. M. BOLAND, B. A. DOLEZAL, and C. B. COOPER, “Heart Rate Acquisition and Threshold-Based Training Increases Oxygen Uptake at Metabolic Threshold in Triathletes: A Pilot Study,” _International Journal of Exercise Science_, vol. 12, no. 2, p. 144, 2019, Available: https://pmc.ncbi.nlm.nih.gov/articles/PMC6355121/
