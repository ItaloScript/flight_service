-- CreateTable
CREATE TABLE "public"."Airline" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "iata_code" TEXT NOT NULL,

    CONSTRAINT "Airline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Airport" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "iata_code" TEXT NOT NULL,
    "timezone" TEXT NOT NULL,

    CONSTRAINT "Airport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Flight" (
    "id" SERIAL NOT NULL,
    "flight_number" TEXT NOT NULL,
    "airline_id" INTEGER NOT NULL,
    "origin_iata" TEXT NOT NULL,
    "destination_iata" TEXT NOT NULL,
    "departure_time_local" TEXT NOT NULL,
    "arrival_time_local" TEXT NOT NULL,
    "frequency" INTEGER[],

    CONSTRAINT "Flight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Leg" (
    "id" SERIAL NOT NULL,
    "flight_id" INTEGER NOT NULL,
    "service_date" TIMESTAMP(3) NOT NULL,
    "departure_datetime_utc" TIMESTAMP(3) NOT NULL,
    "arrival_datetime_utc" TIMESTAMP(3) NOT NULL,
    "capacity_total" INTEGER NOT NULL,
    "seats_available" INTEGER NOT NULL,

    CONSTRAINT "Leg_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Itinerary" (
    "id" SERIAL NOT NULL,

    CONSTRAINT "Itinerary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ItineraryLeg" (
    "id" SERIAL NOT NULL,
    "itineraryId" INTEGER NOT NULL,
    "legId" INTEGER NOT NULL,

    CONSTRAINT "ItineraryLeg_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Booking" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "itinerary_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."IdempotencyKey" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IdempotencyKey_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "Airline_iata_code_key" ON "public"."Airline"("iata_code");

-- CreateIndex
CREATE UNIQUE INDEX "Airport_iata_code_key" ON "public"."Airport"("iata_code");

-- AddForeignKey
ALTER TABLE "public"."Flight" ADD CONSTRAINT "Flight_airline_id_fkey" FOREIGN KEY ("airline_id") REFERENCES "public"."Airline"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Flight" ADD CONSTRAINT "Flight_origin_iata_fkey" FOREIGN KEY ("origin_iata") REFERENCES "public"."Airport"("iata_code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Flight" ADD CONSTRAINT "Flight_destination_iata_fkey" FOREIGN KEY ("destination_iata") REFERENCES "public"."Airport"("iata_code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Leg" ADD CONSTRAINT "Leg_flight_id_fkey" FOREIGN KEY ("flight_id") REFERENCES "public"."Flight"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ItineraryLeg" ADD CONSTRAINT "ItineraryLeg_itineraryId_fkey" FOREIGN KEY ("itineraryId") REFERENCES "public"."Itinerary"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ItineraryLeg" ADD CONSTRAINT "ItineraryLeg_legId_fkey" FOREIGN KEY ("legId") REFERENCES "public"."Leg"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_itinerary_id_fkey" FOREIGN KEY ("itinerary_id") REFERENCES "public"."Itinerary"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
