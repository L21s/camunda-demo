# insurance-claim-demo
Das demo Projekt implementiert ein beispielhaftes Prozess zur verarbeitung eines Versicherungsanspruchs. Der Prozess ist durch das folgende BPMN Diagramm beschrieben:

![insurance claim process BPMN](https://github.com/kerilz/insurance-claim-demo/blob/7437c7ed763d91b2230f6aeb61a11e4b7d513467/claim.png)

**Projektstruktur:**

- insurance-claim-demo: Embedded Camunda Engine in form von einer Spring Boot App
- risk: Risikobewertung Rest Service
- external_task_client: eine Sammlung von External Task Workers zur Bearbeitung von [Service Tasks](https://docs.camunda.org/manual/7.20/reference/bpmn20/tasks/service-task/)
- express_server: gibt eine Übersicht über alle Prozessinstanzen (einzelne Versicherungsansprüche)
- models: BPMN und DMN Modelle, HTML Forms für User Tasks

**Ablauf:**

1. Der Prozess fängt an mit Einreichen von Versicherungsanspruchsdaten durch den Versicherungsnehmer. Die beispielhafte Daten findet man unter ./demoData.json.
2. Die Daten werden durch einen [External Task Worker](https://docs.camunda.org/manual/7.20/user-guide/ext-client/) validiert und gespeichert
3. Der Anspruch wird durch einen Mitarbeiter (implementiert als [User Task](https://docs.camunda.org/manual/7.20/reference/bpmn20/tasks/user-task/)) registriert, falls die Daten valide sind, andererfals wird ein [Error Boundary Event](https://docs.camunda.org/manual/7.20/reference/bpmn20/events/error-events/#error-boundary-event) den Prozess in andere Richtung führen. Versicherungsnehmer wird durch einen Mitarbeiter für Unterstützung kontaktiert. In beiden Fällen bekommt der Versicherungsnehmer entsprechende Nachricht, die auch vom External Task Worker verschickt wird.
4.
   - Nachricht über Erfolgreiche Registrierung des Anspruchs wird verschickt.
   - Das Risiko (Dubiosität) des Anspruchs wird geschätzt. External Task Worker schickt eine Anfrage ans Risikobewertungservice.
5. Ein Mitarbeiter lädt Dokumente hoch.
6. Dokumente werden validiert (nur PDF ist akzeptiert, Ergebniss der Validierung sieht man in den external_task_client Log), falls eine nicht-PDF Datei hochgeladen wurde, geht der Prozess zurück zum letzten Schritt.
7. Durch das folgende [DMN](https://en.wikipedia.org/wiki/Decision_Model_and_Notation) Modell wird entschieden ob Automatische Genehmigung des Anspruchs <br>
![claim DMN](https://github.com/kerilz/insurance-claim-demo/blob/7437c7ed763d91b2230f6aeb61a11e4b7d513467/dmn.png)
8. Falls Automatische Genehmigung möglich ist, wird gleich eine Bezahlung an den Versicherungsnehmer initiiert (implementiert durch [Java Delegate](https://docs.camunda.org/manual/7.20/user-guide/process-engine/delegation-code/#java-delegate))
9. Falls keine Automatische Genehmigung möglich ist, wird der Anspruch manuell durch einen Mitarbeiter Genehmigt oder Abgelehnt
10. In beiden Fällen wird an den Versicherungsnehmer eine entsprechende Nachricht verschickt.

Somit endet Der Prozess

**Schritte zum Ausführen:**

- external_task_client/emailConfig.yaml muss mit Email Zugangsdaten Konfiguriert werden
- `docker-compose up` im Root-Directory
- Warten bis `Camunda engine has started. Subscribing to tasks...` im Log erscheint
- Camunda Benutzeroberfläche läuft unter `localhost:8080`. Username und Password sind jeweils `demo`
- Zum Starten einer Prozessintanz muss ein REST Request folgender form verschickt werden: <br>
```
curl --location 'http://localhost:8080/engine-rest/process-definition/key/insuranceClaim/start' \
--header 'Content-Type: application/json' \
--data-raw '{
    "variables": {
        "claimData": {
            "value": "{\"policyHolder\":{\"fullName\":\"Kyrylo Zakurdaiev\",\"dob\":\"27-01-1997\",\"address\":\"Musterstraße 123, Stadtstadt, Bundesland\",\"contactNumber\":\"+49123456789\",\"email\":\"kyrylo.zakurdaiev@l21s.de\"},\"incident\":{\"date\":\"05-03-2024\",\"location\":\"Eichenweg 12, Stadtstadt, Bundesland\",\"description\":\"Autounfall auf dem Weg zur Arbeit\"},\"damageDetails\":{\"estimatedCost\":6000.00,\"description\":\"Beschädigung der vorderen Stoßstange und des linken Scheinwerfers\",\"photos\":[\"https://example.de/foto1.jpg\",\"https://example.de/foto2.jpg\"]}}",
            "type": "json"
        }
    }
}'
```
Wie oben beschrieben
1. Daten werden automatisch Validiert
2. User geht zu `http://localhost:8080/camunda/app/tasklist/` und erledigt die Usertask (oben recht Claim anclicken, checkboxen checken, Task completen)
3. Risiko wird bewertet und Benutzer benachrichtigt (automatisch)
4. `http://localhost:8080/camunda/app/tasklist/`, User lädt ein Dokument hoch (oben recht Claim anclicken, PDF Dokument wählen, Task completen)
5. Es wird über automatische Genehmigung in dem DMN Task entschieden (automatisch)
6. Falls keine automatische Genehmigung möglich, erledigt der User den Task "Manual Review": `http://localhost:8080/camunda/app/tasklist/`, oben recht Claim anclicken, Checkbox anclicken, Task completen (die Claim Daten kann man im Cockpit ansehen, siehe Anleitung unten)

- Alle historischen Prozessinstanzen kann man unter `localhost:8081` einsehen.


**CamundaWebApps:**


// TODO

**Weitere Infos:**

- die Oben erwähnten Embedded Camunda Engine sowie Java Delegate Pattern werden nicht mehr von Camunda empfohlen, siehe [Blogpost](https://blog.bernd-ruecker.com/moving-from-embedded-to-remote-workflow-engines-8472992cc371). Da es immer noch ein verbreitetes Pattern ist (insb. bei L21s Kunden), haben wir den hier zum Demonstrationzweck implementiert
